import React from 'react'
import Tile from './Tile.jsx'
export default function HandPanel({hand, selectedIndex, onSelect}){
  return <div>
    <div className="section-title">Рука активного гравця</div>
    <div className="stack">{hand?.map((t,i)=>(<Tile key={i} p={t[0]} q={t[1]} selected={selectedIndex===i} onClick={()=>onSelect(i)}/>))}</div>
    <div className="small" style={{marginTop:6}}>Оберіть кістку, далі натисніть напрям.</div>
  </div>
}
