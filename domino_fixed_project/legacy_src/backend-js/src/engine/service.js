import { Deck, Board, Bot } from './core.js';
export class RoundService {
  constructor(players, maxPip=6){
    this.players = players.map(p=>({...p, hand: []}));
    this.deck = new Deck(maxPip); this.deck.shuffle();
    this.board = new Board(); this.turn = 0; this.bot = new Bot();
    const per = this.players.length===2? 7: 5;
    for(let i=0;i<per;i++) for(const p of this.players){ const t=this.deck.draw(); if(t) p.hand.push(t); }
  }
  current(){ return this.players[this.turn]; }
  next(){ this.turn = (this.turn+1) % this.players.length; }
  _canAny(hand){ if(!this.board.center) return hand.length>0; return hand.some(t => ['L','R','U','D'].some(d => this.board.can(d, t))); }
  move(side, handIndex){ const pl=this.current(); const t=pl.hand[handIndex]; if(!t) return {ok:false}; if(this.board.can(side,t)){ this.board.place(side,t); pl.hand.splice(handIndex,1); return {ok:true, side, tile:[t.p,t.q], player:pl.name}; } return {ok:false}; }
  drawUntilOrPass(){ const pl=this.current(); while(true){ if(this._canAny(pl.hand)) return true; const t=this.deck.draw(); if(!t) return false; pl.hand.push(t); } }
  isBlocked(){ if(this.deck.tiles.length) return false; return this.players.every(p=> !this._canAny(p.hand)); }
  finished(){ if(this.players.some(p=> p.hand.length===0)) return true; return this.isBlocked(); }
  result(){ for(const p of this.players){ if(p.hand.length===0){ let gain=0; for(const o of this.players){ if(o!==p) for(const t of o.hand) gain += t.p + t.q; return {winner:p.name, gain}; } } const sums=this.players.map(p=>({sum:p.hand.reduce((s,t)=>s+t.p+t.q,0), name:p.name})).sort((a,b)=>a.sum-b.sum); const sumOthers=sums.slice(1).reduce((s,x)=>s+x.sum,0); return {winner:sums[0].name, gain: sumOthers - sums[0].sum}; }
  botTurn()
     const pl=this.current(); let m=this.bot.choose(this.board, pl.hand); if(!m){ if(!this.drawUntilOrPass()) return {type:'PASS', player:pl.name}; m=this.bot.choose(this.board, pl.hand); if(!m) return {type:'PASS', player:pl.name}; } const [side,t]=m; const idx=pl.hand.findIndex(x=>x.p===t.p && x.q===t.q); const r=this.move(side, idx); return {type:'MOVE', player:pl.name, side:r.side, tile:r.tile}; }
}
