import React from 'react'
import Tile from './Tile.jsx'
export default function Line({title, tiles}){
  return <div className="stack"><span className="badge">{title}</span>{tiles.map((t,i)=><Tile key={i} p={t[0]} q={t[1]}/>)}</div>
}
