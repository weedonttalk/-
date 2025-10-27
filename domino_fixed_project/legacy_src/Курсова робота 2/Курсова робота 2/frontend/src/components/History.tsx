import { useEffect, useState } from 'react';
import { api } from '../api';
import { MoveRow } from '../types';

export default function History(){
  const [rows, setRows] = useState<MoveRow[]>([]);
  const load = async ()=> setRows(await api('/api/history'));
  useEffect(()=>{ load(); },[]);
  useEffect(()=>{ const h = ()=> load(); window.addEventListener('domino:refreshHistory', h); return ()=> window.removeEventListener('domino:refreshHistory', h); },[]);
  return (
    <div className="history">
      <div className="font-semibold mb-2">Історія ходів</div>
      {rows.length===0? <div className="text-neutral-400">Поки пусто</div> :
        <ol className="space-y-1">{rows.map(r=> (
          <li key={r.idx}><span className="text-neutral-500">#{r.idx}</span> <b>{r.player}</b>: {r.side==='PASS'? 'пас' : `${r.side}:${r.p}|${r.q}`}</li>
        ))}</ol>
      }
    </div>
  );
}
