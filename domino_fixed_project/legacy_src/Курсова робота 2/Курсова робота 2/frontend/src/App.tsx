import { useEffect, useState } from 'react';
import SetupForm from './components/SetupForm';
import Board from './components/Board';
import Hand from './components/Hand';
import Controls from './components/Controls';
import ReplayToasts from './components/ReplayToasts';
import History from './components/History';
import { api } from './api';
import { State, ReplayItem } from './types';

export default function App(){
  const [state,setState]=useState<State|null>(null);
  const [replay,setReplay]=useState<ReplayItem[]>([]);
  const load=async()=> { const s = await api('/api/state'); setState(s); };
  useEffect(()=>{ load(); },[]);
  if(!state || (state as any).error) return <SetupForm onReady={()=>{ load(); }}/>;
  const turn=state.turn; const me=state.hands[turn];
  const ends = state.board.ends;
  const center = state.board.center;
  const canSide = (side:'L'|'R'|'U'|'D', i:number)=>{
    if(!center) return true;
    const e = ends[side];
    const [p,q] = me[i];
    return e===null || p===e || q===e;
  };
  const move=async(side:'L'|'R'|'U'|'D', i:number)=>{ const r = await api('/api/move',{method:'POST',body:JSON.stringify({side, hand_index:i})}); setState(r.state); setReplay(r.replay||[]); window.dispatchEvent(new Event('domino:refreshHistory')); };
  const draw=async()=>{ const r = await api('/api/draw',{method:'POST'}); setState(r.state); setReplay(r.replay||[]); window.dispatchEvent(new Event('domino:refreshHistory')); };
  const next=async()=>{ const r = await api('/api/next',{method:'POST'}); setState(r); setReplay(r.replay||[]); window.dispatchEvent(new Event('domino:refreshHistory')); };
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Доміно — веб</h1>
        <div className="text-sm text-neutral-500">Хід: <b>{state.players[turn].name}</b> ({state.players[turn].is_bot? 'Bot':'Human'})</div>
      </header>
      <div className="text-sm text-neutral-600">Цільові очки: {state.target_score ?? '—'}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Board board={state.board}/>
          <section className="space-y-2 mt-4">
            <div className="text-sm">Рука гравця: <b>{state.players[turn].name}</b></div>
            <Hand hand={me} board={state.board} onPick={(i)=>{/* choose direction with buttons */}}/>
            <Controls
              canL={me.some((_,i)=>canSide('L',i))}
              canR={me.some((_,i)=>canSide('R',i))}
              canU={me.some((_,i)=>canSide('U',i))}
              canD={me.some((_,i)=>canSide('D',i))}
              onL={()=>{ const i=me.findIndex((_,k)=>canSide('L',k)); if(i>=0) move('L', i);} }
              onR={()=>{ const i=me.findIndex((_,k)=>canSide('R',k)); if(i>=0) move('R', i);} }
              onU={()=>{ const i=me.findIndex((_,k)=>canSide('U',k)); if(i>=0) move('U', i);} }
              onD={()=>{ const i=me.findIndex((_,k)=>canSide('D',k)); if(i>=0) move('D', i);} }
              onDraw={draw}
              onNext={next}
            />
          </section>
        </div>
        <div>
          <History/>
        </div>
      </div>
      <ReplayToasts items={replay}/>
    </div>
  );
}
