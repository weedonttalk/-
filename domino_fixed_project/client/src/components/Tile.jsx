import React from 'react'
export default function Tile({p,q, selected, onClick}){
  return <div className="tile" onClick={onClick} style={{outline:selected?'2px solid #81d8d0':'none'}}>{p}|{q}</div>
}
