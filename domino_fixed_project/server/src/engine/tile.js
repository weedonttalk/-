export class Tile{ constructor(p,q){ this.p=p; this.q=q } isDouble(){ return this.p===this.q } flipped(){ return new Tile(this.q,this.p) } toJSON(){ return [this.p,this.q] }}
