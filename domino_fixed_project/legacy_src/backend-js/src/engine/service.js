
import { Deck, Board, Bot, Tile } from './core.js';

export class RoundService {
  constructor(players, maxPip=6){
    this.players = players.map((p,i)=>({ _id: p._id||String(i), name: p.name, hand: [], isBot: p.isBot||false }));
    this.deck = new Deck(maxPip); this.deck.shuffle();
    this.board = new Board();
    this.turn = 0;
    this.moveIdx = 0;
    this.history = [];
    this.bot = new Bot();
    // deal
    const per = this.players.length===2 ? 7 : 5;
    for(let i=0;i<per;i++){
      for(const p of this.players){ const t = this.deck.draw(); if(t) p.hand.push(t); }
    }
  }

  current(){ return this.players[this.turn]; }
  next(){ this.turn = (this.turn + 1) % this.players.length; }

  _handTiles(hand){ return hand; }

  _findPlayable(hand){
    if(!this.board.center) return hand.length ? { handIndex:0, side:'R' } : null;
    for(let i=0;i<hand.length;i++){
      const t = hand[i];
      for(const d of ['L','R','U','D']){
        if(this.board.can(d, t)) return { handIndex: i, side: d, tile: [t.p,t.q] };
      }
    }
    return null;
  }

  move(side, handIndex){
    const pl = this.current();
    if(handIndex<0 || handIndex>=pl.hand.length) return { ok:false };
    const t = pl.hand.splice(handIndex,1)[0];
    // place on board
    this.board.place(side, t);
    this.history.push({ type:'MOVE', idx: this.moveIdx++, player: pl.name, side, tile: [t.p,t.q] });
    return { ok:true, side, tile: [t.p,t.q] };
  }

  drawUntilOrPass(){
    const pl = this.current();
    while(true){
      // if any playable now, stop
      const can = this._findPlayable(pl.hand);
      if(can) return true;
      const t = this.deck.draw();
      if(!t) return false; // pass
      pl.hand.push(t);
      this.history.push({ type:'DRAW', idx: this.moveIdx++, player: pl.name, tile:[t.p,t.q] });
      // if now playable, break next loop will detect
    }
  }

  isBlocked(){
    if(this.deck.length>0) return false;
    return this.players.every(p => !this._findPlayable(p.hand));
  }

  finished(){
    if(this.players.some(p=> p.hand.length===0)) return true;
    return this.isBlocked();
  }

  result(){
    // find winner (hand empty) or compute pip sums
    const winner = this.players.find(p=>p.hand.length===0);
    if(winner) {
      const sumOthers = this.players.reduce((acc,p)=> acc + p.hand.reduce((s,t)=>s+t.p+t.q,0) ,0);
      const winnerSum = 0;
      return { winner: winner.name, gain: sumOthers - winnerSum };
    }
    // block case: compute sums
    const sums = this.players.map(p=>({ name:p.name, sum: p.hand.reduce((s,t)=>s+t.p+t.q,0) }));
    sums.sort((a,b)=>a.sum-b.sum);
    const gain = sums.slice(1).reduce((acc,s)=>acc+s.sum,0) - sums[0].sum;
    return { winner: sums[0].name, gain };
  }

  botTurn(){
    const pl = this.current();
    if(!pl.isBot) return null;
    const choice = this.bot.choose(this.board, pl.hand);
    if(choice.action==='move'){
      return this.move(choice.side, choice.handIndex);
    } else {
      const could = this.drawUntilOrPass();
      if(!could){ this.history.push({ type:'PASS', idx:this.moveIdx++, player: pl.name }); this.next(); return { ok:false, type:'PASS' }; }
      return { ok:true, type:'DRAW' };
    }
  }

  snapshot(){
    const hands = {}; for(const p of this.players){ hands[p._id] = p.hand.map(t=>[t.p,t.q]); }
    return { board: this.board.snapshot(), hands, turn: this.current()._id, deck: this.deck.length };
  }
}
