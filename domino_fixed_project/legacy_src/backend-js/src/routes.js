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
    return data || null;
  }catch(e){
    return null;
  }
}

function state(){
  return {
    board: STATE.rs ? serializeBoard(STATE.rs.board) : null,
    hands: STATE.rs ? STATE.rs.players.reduce((acc,p)=>{ acc[p._id]=p.hand.map(t=>[t.p,t.q]); return acc },{}) : {},
    turn: STATE.rs ? STATE.rs.current()._id : null,
    match: STATE.match || null,
    round: STATE.round || null
  };
}

async function autoPlayIfBotTurn(){
  const out = [];
  if(!STATE.rs) return out;
  while(STATE.rs && STATE.rs.current().isBot && !STATE.rs.finished()){
    const res = STATE.rs.botTurn();
    if(res && res.ok !== undefined) out.push(res);
    // if bot moved and game not finished, advance turn
    if(!STATE.rs.finished()) STATE.rs.next();
  }
  return out;
}

function logMoveIfPossible(playerName, type, payload){
  if(!STATE.match) return;
  // try to record using DAO; payload can be object
  try{ logMove(STATE.round? STATE.round._id : null, playerName, type, payload); }catch(e){}
}

async function autoPlayAfterHuman(){
  // after a human action, allow bots to play
  const replay = await autoPlayIfBotTurn();
  return replay;
}

router.get('/api/health', (_req,res)=>{ res.json({ok:true}); });

router.post('/api/new', async (req,res)=>{
  const { players } = req.body;
  if(!players || players.length<2) return res.status(400).json({error:'need players'});
  // ensure players in DB
  const saved = [];
  for(const p of players){
    const pl = await upsertPlayer({ name: p.name });
    saved.push(pl);
    STATE.nameToId[pl.name]=pl._id;
  }
  const match = await createMatch({ targetScore:100 });
  const round = await createRound({ matchId: match._id });
  STATE.match = match; STATE.round = round;
  // create RoundService with saved players
  STATE.rs = new RoundService(saved.map(p=>({ _id: String(p._id), name: p.name, isBot: p.isBot })));
  STATE.moveIdx = 0;
  res.json({ matchId: String(match._id), state: state() });
});

router.get('/api/state', (req,res)=>{ res.json(state()); });

router.get('/api/history', async (req,res)=>{
  if(!STATE.round) return res.json([]);
  const rows = await movesForRound(STATE.round._id);
  const nameById = Object.fromEntries(Object.entries(STATE.nameToId).map(([k,v])=>[String(v),k]));
  const out = rows.map(r=>({ idx: r.idx_in_round, side: r.side, player: nameById[String(r.player_id)] || `id:${r.player_id}`, tile: r.tile }));
  res.json(out);
});

router.post('/api/move', async (req,res)=>{
  const { side, hand_index } = req.body;
  const rs = STATE.rs; if(!rs) return res.status(400).json({error:'no_game'});
  const cur = rs.current();
  const r = rs.move(side, hand_index);
  if(r.ok){ logMoveIfPossible(cur.name,'MOVE', { side: r.side, tile: r.tile }); }
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
    const cur = rs.current();
    logMoveIfPossible(cur.name,'PASS');
    if(!rs.finished()){ rs.next(); replay = await autoPlayIfBotTurn(); }
  }
  return res.json({ can_move: could, finished: rs.finished(), state: state(), replay });
});

router.post('/api/next', async (req,res)=>{
  const rs = STATE.rs; if(!rs) return res.status(400).json({error:'no_game'});
  rs.next();
  const replay = await autoPlayIfBotTurn();
  return res.json({ ...state(), replay });
});

router.post('/api/bot', async (req,res)=>{
  const rs = STATE.rs; if(!rs) return res.status(400).json({error:'no_game'});
  const cur = rs.current();
  if(!cur.isBot) return res.status(400).json({error:'not_bot'});
  const r = rs.botTurn();
  if(r && r.ok) logMoveIfPossible(cur.name,'MOVE', { side: r.side, tile: r.tile });
  if(!rs.finished() && cur.isBot) rs.next();
  const replay = await autoPlayIfBotTurn();
  res.json({ ok: true, state: state(), replay });
});

router.post('/api/finish', async (req,res)=>{
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
