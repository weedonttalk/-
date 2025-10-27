import { useState } from 'react';
import { api } from '../api';
export default function SetupForm({onReady}:{onReady:()=>void}){
  const [names, setNames] = useState(['Player1','BotA']);
  const [types, setTypes] = useState(['Human','Bot']);
  const [target, setTarget] = useState<number|''>('');
  const addPlayer = ()=>{ if(names.length<4){ setNames([...names, `Player${names.length+1}`]); setTypes([...types, 'Bot']); } };
  const rmPlayer = ()=>{ if(names.length>2){ setNames(names.slice(0,-1)); setTypes(types.slice(0,-1)); } };
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState<string|null>(null);
  const start = async ()=>{
    setErr(null); setLoading(true);
    try{
      const players = names.map((n,i)=>({name:n, is_bot: types[i]==='Bot'}));
      await api('/api/new', {method:'POST', body: JSON.stringify({players, target_score: target===''? null : Number(target)})});
      window.dispatchEvent(new Event('domino:refreshHistory'));
      onReady();
    }catch(e:any){ setErr(e?.message||'Не удалось связаться с сервером'); }
    finally{ setLoading(false); }
  }
  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">Нова гра</h1>
      {names.map((n,i)=> (
        <div key={i} className="flex gap-2 items-center">
          <input className="input" value={n} onChange={e=>{const v=[...names]; v[i]=e.target.value; setNames(v);}}/>
          <select className="select" value={types[i]} onChange={e=>{const v=[...types]; v[i]=e.target.value; setTypes(v);}}>
            <option>Human</option><option>Bot</option>
          </select>
        </div>
      ))}
      <div className="flex gap-2">
        <button className="btn" onClick={addPlayer} disabled={names.length>=4}>+ Гравець</button>
        <button className="btn" onClick={rmPlayer} disabled={names.length<=2}>− Гравець</button>
      </div>
      <div className="flex gap-2 items-center">
        <label className="w-48">Цільові очки (порожньо — 1 раунд)</label>
        <input className="input" type="number" value={target} onChange={e=>setTarget((e.target.value as any))} />
      </div>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <button className="btn-primary" onClick={start} disabled={loading}>{loading?'Старт...':'Почати'}</button>
    </div>
  );
}
