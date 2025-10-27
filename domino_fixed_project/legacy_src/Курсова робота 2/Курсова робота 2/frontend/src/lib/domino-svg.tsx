import React from 'react';
export function Domino({t, w=64, h=32, highlight=false}:{t:[number,number]; w?:number; h?:number; highlight?:boolean}){
  const [p,q]=t; const dot=(cx:number,cy:number)=> <circle cx={cx} cy={cy} r={h*0.06}/>;
  const pips=(n:number, x:number, y:number, rw:number, rh:number)=>{
    const cx=x+rw/2, cy=y+rh/2, dx=rw*0.25, dy=rh*0.25; const pts:JSX.Element[]=[];
    const add=(X:number,Y:number)=>pts.push(dot(X,Y));
    if(n===1){add(cx,cy);} 
    else if(n===2){add(x+dx,y+dy); add(x+rw-dx,y+rh-dy);} 
    else if(n===3){add(x+dx,y+dy); add(cx,cy); add(x+rw-dx,y+rh-dy);} 
    else if(n===4){add(x+dx,y+dy); add(x+rw-dx,y+dy); add(x+dx,y+rh-dy); add(x+rw-dx,y+rh-dy);} 
    else if(n===5){pts.push(...pips(4,x,y,rw,rh) as any); add(cx,cy);} 
    else if(n===6){add(x+dx,y+dy); add(x+dx,cy); add(x+dx,y+rh-dy); add(x+rw-dx,y+dy); add(x+rw-dx,cy); add(x+rw-dx,y+rh-dy);} 
    return pts;
  };
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x={0} y={0} width={w} height={h} rx={6} ry={6} fill="white" stroke={highlight? 'green' : 'black'} strokeWidth={highlight? 2:1}/>
      <line x1={w/2} y1={0} x2={w/2} y2={h} stroke="black"/>
      <g fill="black">{pips(p, 0, 0, w/2, h)}{pips(q, w/2, 0, w/2, h)}</g>
    </svg>
  );
}
