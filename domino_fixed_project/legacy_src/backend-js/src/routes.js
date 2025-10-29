import { Router } from 'express';
import { RoundService } from './engine/service.js';
import { upsertPlayer, findPlayerByName } from './dao/players.js';
import { createMatch, addMatchPlayer, addScore, getScores } from './dao/matches.js';
import { createRound, finishRound } from './dao/rounds.js';
import { logMove, movesForRound } from './dao/moves.js';

const router = Router();
const STATE = { rs: null, match: null, round: null, moveIdx: 0, nameToId: {} };

function serializeBoard(b){ return b.snapshot(); }

async function chooseViaApi(board, hand){
  const url = process.env.AI_BOT_URL;
  if(!url) return null;
  try{
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', ...(process.env.AI_BOT_KEY ? {'Authorization': `Bearer ${process.env.AI_BOT_KEY}`} : {}) },
      body: JSON.stringify({ board, hand })
    });
    if(!r.ok) return null;
    const data = await r.json();
    if(!data || !data.side || typeof data.index!=='number') return null;
    return data;
  }catch(e){ return null; }
}

function logMoveIfPossible(playerName, kind, payload){
  if(!STATE.round) return;
  const pid = STATE.nameToId[playerName];
  if(!pid) return;
  STATE.moveIdx += 1;
  if(kind==='PASS'){ logMove(STATE.round._id, pid, 'PASS', null, null, STATE.moveIdx); }
  else if(kind==='MOVE'){ const { side, tile } = payload; logMove(STATE.round._id, pid, side, tile[0], tile[1], STATE.moveIdx); }
}

async function autoPlayIfBotTurn(){
  const rs = STATE.rs; if(!rs) return [];
  const replay = [];
  while(!rs.finished() && rs.current().is_bot){
    const board = serializeBoard(rs.board);
    const hand = rs.current().hand.map(t=>[t.p,t.q]);
    const apiMove = await chooseViaApi(board, hand);
    if(apiMove){
      const r = rs.move(apiMove.side, apiMove.index);
      if(r.ok){ replay.push({player: rs.current().name, type:'MOVE', side: r.side, tile: r.tile}); logMoveIfPossible(rs.current().name,'MOVE',{side:r.side, tile:r.tile}); }
      else { replay.push({player: rs.current().name, type:'PASS'}); logMoveIfPossible(rs.current().name,'PASS'); }
    }else{
      const r = rs.botTurn();
      replay.push(r);
      if(r.type==='MOVE') logMoveIfPossible(r.player,'MOVE',{side:r.side, tile:r.tile});
      else logMoveIfPossible(r.player,'PASS');
    }
    if(!rs.finished()) rs.next();
  }
  return replay;
}

router.post('/api/new', async (req,res)=>{
  const { players, target_score } = req.body;
  STATE.rs = new RoundService(players);
  const m = await createMatch(target_score ?? null); STATE.match = m; STATE.moveIdx = 0; STATE.nameToId = {};
  const ids = [];
  for(const p of players){
    const row = await upsertPlayer(p.name, !!p.is_bot);
    ids.push(row._id);
  }
  players.forEach((p,i)=> STATE.nameToId[p.name] = ids[i]);
  for(const id of ids) await addMatchPlayer(m._id, id);
  STATE.round = await createRound(m._id, 1);
  const replay = await autoPlayIfBotTurn();
  return res.json({...state(), replay});
});

function state(){
  const rs = STATE.rs; if(!rs) return { error: 'no_game' };
  return {
    board: serializeBoard(rs.board),
    hands: rs.players.map(pl=> pl.hand.map(t=>[t.p,t.q]) ),
    players: rs.players.map(pl=> ({name:pl.name, is_bot: !!pl.is_bot}) ),
    turn: rs.turn,
    target_score: STATE.match?.target_score ?? null,
    scores: []
  };
}

router.get('/api/state', (req,res)=>{ res.json(state()); });

router.get('/api/history', async (req,res)=>{
  if(!STATE.round) return res.json([]);
  const rows = await movesForRound(STATE.round._id);
  const nameById = Object.fromEntries(Object.entries(STATE.nameToId).map(([k,v])=>[String(v),k]));
  const out = rows.map(r=>({ idx: r.idx_in_round, side: r.side, p: r.p, q: r.q, player: nameById[String(r.player_id)] || `id:${r.player_id}` }));
  res.json(out);
});

router.post('/api/move', async (req,res)=>{
  const { side, hand_index } = req.body; const rs = STATE.rs; if(!rs) return res.status(400).json({error:'no_game'});
  const cur = rs.current(); const r = rs.move(side, hand_index);
  if(r.ok){ logMoveIfPossible(cur.name,'MOVE',{side:r.side, tile:r.tile}); }
  let replay = [];
  if(r.ok && !rs.finished()){
    rs.next();
    replay = await autoPlayIfBotTurn();
  }
  return res.json({ ok: r.ok, finished: rs.finished(), state: state(), replay });
});

router.post('/api/draw', async (req,res)=>{
  const rs = STATE.rs; if(!rs) return res.status(400).json({error:'no_game'});
  const could = rs.drawUntilOrPass();
  let replay = [];
  if(!could){
    logMoveIfPossible(rs.current().name,'PASS');
    if(!rs.finished()){ rs.next(); replay = await autoPlayIfBotTurn(); }
  }
  return res.json({ can_move: could, finished: rs.finished(), state: state(), replay });
});

router.post('/api/next', async (req,res)=>{ 
  const rs = STATE.rs; if(!rs) return res.status(400).json({error:'no_game'}); 
  rs.next(); const replay = await autoPlayIfBotTurn(); return res.json({ ...state(), replay }); 
});

router.post('/api/bot', async (req,res)=>{ 
  const rs = STATE.rs; if(!rs) return res.status(400).json({error:'no_game'}); 
  let result = {type:'PASS', player: rs.current().name};
  const board = serializeBoard(rs.board);
  const hand = rs.current().hand.map(t=>[t.p,t.q]);
  const apiMove = await chooseViaApi(board, hand);
  if(apiMove){
    const r = rs.move(apiMove.side, apiMove.index);
    if(r.ok){ result = {type:'MOVE', player: rs.current().name, side:r.side, tile:r.tile}; logMoveIfPossible(result.player,'MOVE',{side:r.side,tile:r.tile}); }
  }else{
    const r = rs.botTurn(); result = r; if(r.type==='MOVE') logMoveIfPossible(r.player,'MOVE',{side:r.side,tile:r.tile});
  }
  return res.json({ result, finished: rs.finished(), state: state() }); 
});

router.get('/api/result', async (req,res)=>{
  const rs = STATE.rs; if(!rs) return res.status(400).json({error:'no_game'});
  const { winner, gain } = rs.result();
  if(STATE.match){
    const winnerId = STATE.nameToId[winner];
    if(winnerId){
      await addScore(STATE.match._id, winnerId, gain);
      if(STATE.round){ await finishRound(STATE.round._id, winnerId, gain); }
    }
  }
  const scores = STATE.match ? await getScores(STATE.match._id) : [];
  return res.json({ winner, gain, scores });
});

export default router;
