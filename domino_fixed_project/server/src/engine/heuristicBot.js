import { SIDES } from './constants.js'
export class HeuristicBot{
  choose(board, hand){
    const legal=[]
    for(let i=0;i<hand.length;i++){
      const t=hand[i]
      for(const s of SIDES){
        const e = board.end(s)
        if(e===null || t.p===e || t.q===e) legal.push({side:s,index:i,tile:t})
      }
    }
    if(legal.length===0) return null
    const freq=new Map(); for(const t of hand){ freq.set(t.p,(freq.get(t.p)||0)+1); freq.set(t.q,(freq.get(t.q)||0)+1) }
    const score = (m)=> (m.tile.p+m.tile.q) + (m.tile.p===m.tile.q?2:0) + (freq.get(m.tile.p)||0)+(freq.get(m.tile.q)||0)
    legal.sort((a,b)=>score(b)-score(a))
    return legal[0]
  }
}
