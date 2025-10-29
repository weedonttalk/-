import { Tile } from './tile.js'
export class Board{
  constructor(){ this.center=null; this.L=[]; this.R=[]; this.U=[]; this.D=[] }
  end(side){
    if(!this.center) return null
    const arr=this[side]
    if(arr.length===0){
      switch(side){ case 'L': return this.center.p; case 'R': return this.center.q; case 'U': return this.center.p; case 'D': return this.center.q }
    }
    return arr[arr.length-1].q
  }
  can(side,tile){ if(!this.center) return true; const e=this.end(side); return tile.p===e || tile.q===e }
  place(side,tile){
    if(!this.center){ this.center=new Tile(tile.p,tile.q); return }
    const e=this.end(side)
    if(tile.p===e){ this[side].push(new Tile(tile.q,tile.p)) }
    else if(tile.q===e){ this[side].push(new Tile(tile.p,tile.q)) }
    else throw new Error('Invalid move')
  }
  snapshot(){ return { center:this.center? [this.center.p,this.center.q]:null, L:this.L.map(t=>[t.p,t.q]), R:this.R.map(t=>[t.p,t.q]), U:this.U.map(t=>[t.p,t.q]), D:this.D.map(t=>[t.p,t.q]), ends:{ L:this.center?this.end('L'):null, R:this.center?this.end('R'):null, U:this.center?this.end('U'):null, D:this.center?this.end('D'):null } } }
}
