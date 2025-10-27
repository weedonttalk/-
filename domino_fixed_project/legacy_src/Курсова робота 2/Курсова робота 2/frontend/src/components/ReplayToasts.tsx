import { useEffect, useState } from 'react';
import { ReplayItem } from '../types';

export default function ReplayToasts({items}:{items:ReplayItem[]}){
  const [queue, setQueue] = useState<ReplayItem[]>([]);
  useEffect(()=>{ if(items && items.length) setQueue(items); }, [items]);
  useEffect(()=>{ if(queue.length===0) return; const t = setTimeout(()=> setQueue(q=> q.slice(1)), 700); return ()=> clearTimeout(t); }, [queue]);
  if(queue.length===0) return null;
  const cur = queue[0];
  return (
    <div className="toast-wrap">
      <div className="toast opacity-90">{cur.player}: {cur.type==='PASS'? 'пас' : `${cur.side}:${cur.tile?.[0]}|${cur.tile?.[1]}`}</div>
    </div>
  );
}
