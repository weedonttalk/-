import { Tile } from './tile.js'
export class Deck{
  constructor(max=6){ this.tiles=[]; for(let i=0;i<=max;i++){ for(let j=i;j<=max;j++){ this.tiles.push(new Tile(i,j))}} this.shuffle() }
  shuffle(){ for(let i=this.tiles.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [this.tiles[i],this.tiles[j]]=[this.tiles[j],this.tiles[i]] } }
  draw(){ return this.tiles.pop()||null }
  get length(){ return this.tiles.length }
}
