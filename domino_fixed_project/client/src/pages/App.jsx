import React, { useState, useEffect } from 'react'
import SetupForm from '../components/SetupForm.jsx'
import Controls from '../components/Controls.jsx'
import BoardView from '../components/BoardView.jsx'
import HandPanel from '../components/HandPanel.jsx'
import HistoryPanel from '../components/HistoryPanel.jsx'
import { newGame, state, move, draw, passApi, botSuggestHeuristic, botSuggestOpenAI } from '../api.js'

export default function App(){
  const [matchId, setMatchId] = useState(null)
  const [game, setGame] = useState(null)
  const [me, setMe] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)

  useEffect(()=>{
    if(!matchId) return
    const t = setInterval(async ()=>{
      try{
        const s = await state(matchId)
        setGame(s)
      }catch(_){}
    }, 800)
    return ()=>clearInterval(t)
  }, [matchId])

  async function start(players){
    try {
      const r = await newGame({ players });
      setMatchId(r.matchId);
      // Если сервер возвращает state, можно раскомментировать:
      // setGame(r.state);
    } catch (e) {
      console.error(e);
      // Если у вас есть тостер/уведомления — раскомментируйте:
      // setToast('Не вийшло створити матч. Перевірте сервер і MONGODB_URI у server/.env');
    }
  }

  async function doPlay(){
    if(!matchId || !game) return
    if(selectedIndex==null){ return }
    const myHand = game?.hands?.[me] || []
    const tile = myHand[selectedIndex]
    if(!tile) return
    await move({ matchId, playerIndex: me, tile })
    setSelectedIndex(null)
  }
  async function doDraw(){
    if(!matchId) return
    await draw({ matchId, playerIndex: me })
  }
  async function doPass(){
    if(!matchId) return
    await passApi(matchId, me)
  }
  async function botHeuristic(){
    if(!matchId) return
    const s = await botSuggestHeuristic(matchId)
    if(s.move){ await move({ matchId, playerIndex: me, tile: s.move }) }
  }
  async function botGPT(){
    if(!matchId) return
    const s = await botSuggestOpenAI(matchId)
    if(s.move){ await move({ matchId, playerIndex: me, tile: s.move }) }
  }

  if(!matchId) return <div className="container"><SetupForm onStart={start} /></div>

  const myHand = game?.hands?.[me] || []
  return <div className="container">
    <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
      <h2 style={{margin:0}}>Партия: {matchId}</h2>
      <div className="small">Ходит: {game?.turnPlayerName || '-'}</div>
    </div>
    <div className="board">
      <div className="card">
        <BoardView board={game?.board || {U:[],D:[],L:[],R:[],center:null}}/>
      </div>
      <div className="col card">
        <HandPanel hand={myHand} selectedIndex={selectedIndex} onSelect={setSelectedIndex}/>
        <div style={{height:12}}/>
        <Controls onPlay={doPlay} onDraw={doDraw} onPass={doPass} onBotHeuristic={botHeuristic} onBotGPT={botGPT} />
        <div style={{height:12}}/>
        <HistoryPanel history={game?.history||[]} />
      </div>
    </div>
  </div>
}
