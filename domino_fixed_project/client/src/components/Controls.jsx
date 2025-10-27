import React from 'react'

export default function Controls({ onPlay, onDraw, onPass, onBotHeuristic, onBotGPT }){
  return <div className="card">
    <div className="row">
      <button className="btn" onClick={()=>onPlay('L')}>Влево</button>
      <button className="btn" onClick={()=>onPlay('R')}>Вправо</button>
    </div>
    <div className="row" style={{marginTop:8}}>
      <button className="btn" onClick={onDraw}>Взять</button>
      <button className="btn" onClick={onPass}>Пас</button>
    </div>
    <div className="row" style={{marginTop:8}}>
      <button className="btn" onClick={onBotHeuristic}>Ход бота (эвристика)</button>
      <button className="btn" onClick={onBotGPT}>Ход бота (ChatGPT)</button>
    </div>
  </div>
}
