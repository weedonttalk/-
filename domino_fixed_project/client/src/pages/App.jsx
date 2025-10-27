import React, { useState, useEffect } from 'react'
import SetupForm from '../components/SetupForm.jsx'
import Controls from '../components/Controls.jsx'
import { newGame, state, move, draw, passApi, botSuggestHeuristic, botSuggestOpenAI } from '../api.js'

export default function App(){
  const [matchId, setMatchId] = useState(null)
  const [game, setGame] = useState(null)
  const [me, setMe] = useState(0)

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

  async function doPlay(){ /* Для наглядки управление ходом реализовано через кнопки бота */ }
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

  return <div className="container">
    <h2>Партия: {matchId}</h2>
    <pre className="card">{JSON.stringify(game, null, 2)}</pre>
    <Controls onPlay={doPlay} onDraw={doDraw} onPass={doPass} onBotHeuristic={botHeuristic} onBotGPT={botGPT} />
  </div>
}
