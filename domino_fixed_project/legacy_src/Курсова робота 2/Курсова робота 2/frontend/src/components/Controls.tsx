export default function Controls({canL, canR, canU, canD, onL, onR, onU, onD, onDraw, onNext}:{ 
  canL:boolean; canR:boolean; canU:boolean; canD:boolean;
  onL:()=>void; onR:()=>void; onU:()=>void; onD:()=>void; onDraw:()=>void; onNext:()=>void;
}){
  return (
    <div className="flex gap-2 flex-wrap">
      <button className="btn" disabled={!canU} onClick={onU}>Вверх</button>
      <button className="btn" disabled={!canL} onClick={onL}>Влево</button>
      <button className="btn" disabled={!canR} onClick={onR}>Вправо</button>
      <button className="btn" disabled={!canD} onClick={onD}>Вниз</button>
      <button className="btn" onClick={onDraw}>Взяти/пас</button>
      <button className="btn" onClick={onNext}>Змінити гравця</button>
    </div>
  );
}
