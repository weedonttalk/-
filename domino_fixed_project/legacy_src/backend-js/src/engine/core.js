
export class Tile {
  constructor(p,q){ this.p=p; this.q=q; }
  flipped(){ return new Tile(this.q,this.p); }
  toArray(){ return [this.p,this.q]; }
  toString(){ return `${this.p}|${this.q}`; }
}

export class Deck {
  constructor(maxPip=6){
    this.tiles = [];
    for(let i=0;i<=maxPip;i++) for(let j=i;j<=maxPip;j++) this.tiles.push(new Tile(i,j));
  }
  shuffle(){
    for(let i=this.tiles.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [this.tiles[i],this.tiles[j]]=[this.tiles[j],this.tiles[i]]; }
  }
  draw(){ return this.tiles.pop() || null; }
  get length(){ return this.tiles.length; }
}

export class Board {
  constructor(){
    this.center = null; // starting double or first tile
    this.lines = { L: [], R: [], U: [], D: [] };
  }
  // returns current end values for each side (null if empty)
  ends(){
    const getEnd = arr => arr.length ? (arr[arr.length-1].q) : null;
    const leftEnd = this.lines.L.length ? this.lines.L[0].p : null;
    const rightEnd = this.lines.R.length ? this.lines.R[this.lines.R.length-1].q : null;
    // For U/D we'll use similar: first element p / last q
    const upEnd = this.lines.U.length ? this.lines.U[this.lines.U.length-1].q : null;
    const downEnd = this.lines.D.length ? this.lines.D[0].p : null;
    const centerVal = this.center ? (this.center.p===this.center.q ? this.center.p : null) : null;
    return { L: leftEnd, R: rightEnd, U: upEnd, D: downEnd, center: this.center ? [this.center.p,this.center.q] : null };
  }
  can(side, tile){
    // Side accepts tile if matches end or board empty
    if(!this.center) return true;
    const ends = this.ends();
    const val = ends[side];
    if(val===null) return true;
    return tile.p===val || tile.q===val;
  }
  place(side, tile){
    // place tile on a side; assume legality checked
    if(!this.center){
      this.center = tile;
      return true;
    }
    const arr = this.lines[side];
    // Decide orientation to match end value
    if(arr.length===0){
      // match center end: for simplicity, append
      arr.push(tile);
      return true;
    } else {
      arr.push(tile);
      return true;
    }
  }
  snapshot(){
    return {
      center: this.center ? [this.center.p,this.center.q] : null,
      L: this.lines.L.map(t=>[t.p,t.q]),
      R: this.lines.R.map(t=>[t.p,t.q]),
      U: this.lines.U.map(t=>[t.p,t.q]),
      D: this.lines.D.map(t=>[t.p,t.q])
    };
  }
}

export class Bot {
  choose(board, hand){
    // naive: return first playable tile with arbitrary side
    for(const t of hand){
      for(const d of ['L','R','U','D']){
        if(board.can(d, t)) return { action:'move', side:d, tile:[t.p,t.q], handIndex: hand.indexOf(t) };
      }
    }
    return { action:'draw_or_pass' };
  }
}
