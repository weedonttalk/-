export function makeSet(max=6){
  const tiles=[]
  for(let i=0;i<=max;i++){
    for(let j=i;j<=max;j++){
      tiles.push([i,j])
    }
  }
  return tiles
}
export function shuffle(arr){
  const a = [...arr]
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1))
    ;[a[i],a[j]]=[a[j],a[i]]
  }
  return a
}
export function deal(tiles, players=2, handSize=7){
  const stock = [...tiles]
  const hands = Array.from({length: players}, ()=>[])
  for(let r=0; r<handSize; r++){
    for(let p=0;p<players;p++){
      hands[p].push(stock.shift())
    }
  }
  return {hands, stock}
}
export function canPlace(board, tile){
  if(board.length===0) return true
  const left = board[0][0]
  const right = board[board.length-1][1]
  const [a,b]=tile
  return a===left || b===left || a===right || b===right
}
export function legalMoves(board, hand){
  const moves=[]
  for(const t of hand){
    if(canPlace(board, t)) moves.push(t)
  }
  return moves
}
export function place(board, tile){
  if(board.length===0){
    return [tile]
  }
  const left = board[0][0]
  const right = board[board.length-1][1]
  const [a,b]=tile
  if(a===right) return [...board, [a,b]]
  if(b===right) return [...board, [b,a]]
  if(b===left) return [[a,b], ...board]
  if(a===left) return [[b,a], ...board]
  throw new Error('illegal placement')
}
export function heuristicMove(board, hand){
  const moves = legalMoves(board, hand)
  if(moves.length===0) return null
  // simple: prefer doubles, then highest sum
  moves.sort((t1,t2)=>{
    const s1 = (t1[0]===t1[1]?100:0) + t1[0]+t1[1]
    const s2 = (t2[0]===t2[1]?100:0) + t2[0]+t2[1]
    return s2-s1
  })
  return moves[0]
}
