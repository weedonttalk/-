import { Domino } from '../lib/domino-svg';
import { BoardState, Tile } from '../types';

function Row({tiles}:{tiles:Tile[]}){
  return <div className="tile-row">{tiles.map((t,i)=>(<Domino key={i} t={t}/>))}</div>;
}
function Col({tiles}:{tiles:Tile[]}){
  return <div className="tile-col">{tiles.slice().reverse().map((t,i)=>(<Domino key={i} t={t} w={32} h={64}/>))}</div>;
}

export default function Board({board}:{board:BoardState}){
  if(!board.center) return <div className="text-neutral-400">(порожньо)</div>;
  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-neutral-50 rounded">
      <Col tiles={board.U} />
      <div className="flex items-center gap-2">
        <Row tiles={[...board.L].reverse()} />
        <Domino t={board.center}/>
        <Row tiles={board.R} />
      </div>
      <Col tiles={board.D} />
    </div>
  );
}
