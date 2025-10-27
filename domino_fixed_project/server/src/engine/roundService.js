import { Deck } from './deck.js'
import { Board } from './board.js'
import { SIDES } from './constants.js'

export class RoundService{
  constructor(players){
    this.players = players.map(p=>({...p, hand:[]}))
    this.board = new Board()
    this.deck = new Deck(6)
    this.turnIndex=0
    this.moveIndex=0
    this.history=[]
    this.deal(); this.chooseStarter()
  }
  deal(){ const per=this.players.length===2?7:5; for(let i=0;i<per;i++){ for(const pl of this.players){ const t=this.deck.draw(); if(t) pl.hand.push(t) } } }
  chooseStarter(){
    let best=-1, idx=0
    this.players.forEach((pl,i)=>{ pl.hand.forEach(t=>{ const key=(t.p===t.q?100:0)+(t.p+t.q); if(key>best){best=key; idx=i} }) })
    this.turnIndex=idx
  }
  playableFor(pl){ const legal=[]; for(let i=0;i<pl.hand.length;i++){ const t=pl.hand[i]; for(const s of SIDES){ if(this.board.can(s,t)) legal.push([s,i]) } } return legal }
  drawUntilPlayableOrPass(pl){
    while(true){
      const legal=this.playableFor(pl)
      if(legal.length>0) return {canPlay:true}
      const t=this.deck.draw()
      if(!t) return {canPlay:false, pass:true}
      pl.hand.push(t)
      this.history.push({type:'draw', playerId:pl._id, tile:[t.p,t.q]})
    }
  }
  move(side, handIndex){
    const pl=this.players[this.turnIndex]
    const tile=pl.hand[handIndex]
    if(!tile) throw new Error('Bad hand index')
    if(!this.board.can(side,tile)) throw new Error('Move not allowed')
    this.board.place(side,tile)
    pl.hand.splice(handIndex,1)
    this.history.push({type:'move', idx:this.moveIndex++, playerId:pl._id, side, tile:[tile.p,tile.q]})
    this.turnIndex=(this.turnIndex+1)%this.players.length
  }
  pass(){
    const pl=this.players[this.turnIndex]
    this.history.push({type:'pass', idx:this.moveIndex++, playerId:pl._id})
    this.turnIndex=(this.turnIndex+1)%this.players.length
  }
  finished(){
    if(this.players.some(p=>p.hand.length===0)) return true
    if(this.deck.length>0) return false
    return false
  }
  snapshot(){
    const turn = this.players[this.turnIndex]._id
    const hands={}; for(const p of this.players){ hands[p._id]=p.hand.map(t=>[t.p,t.q]) }
    return {board:this.board.snapshot(), hands, turn, deck:this.deck.length}
  }
}
