import { Domino } from '../lib/domino-svg';
import { Tile, BoardState } from '../types';

function DirBadges({dirs}:{dirs:Record<'L'|'R'|'U'|'D',boolean>}){
  return (
    <div className="flex gap-1 mt-1 justify-center">
      {(['U','L','R','D'] as const).map(d => <span key={d} className={`badge ${dirs[d]? 'badge-on':''}`}>{d}</span>)}
    </div>
  );
}

export default function Hand({hand, board, onPick}:{hand:Tile[]; board:BoardState; onPick:(i:number)=>void}){
  const ends = board.ends;
  const canSide = (side:'L'|'R'|'U'|'D', t:Tile)=>{
    if(!board.center) return true;
    const e = ends[side];
    return e===null || t[0]===e || t[1]===e;
  };
  return (
    <div className="flex gap-2 flex-wrap">
      {hand.map((t,i)=> {
        const dirs = { L: canSide('L',t), R: canSide('R',t), U: canSide('U',t), D: canSide('D',t) };
        const any = dirs.L||dirs.R||dirs.U||dirs.D;
        return (
          <button key={i} className="hover:scale-105 transition text-center" onClick={()=>onPick(i)}>
            <Domino t={t} highlight={any}/>
            <DirBadges dirs={dirs}/>
          </button>
        );
      })}
    </div>
  );
}
