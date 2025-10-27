export function computeWinGain(players, winner){
  let gain=0
  for(const p of players){ if(p!==winner) gain += p.hand.reduce((s,t)=>s+t.p+t.q,0) }
  return gain
}
