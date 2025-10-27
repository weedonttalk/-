export type Tile = [number, number];
export type Player = { name: string; is_bot?: boolean };
export type BoardState = { center: Tile|null, L: Tile[], R: Tile[], U: Tile[], D: Tile[], ends: {L:number|null,R:number|null,U:number|null,D:number|null} };
export type MoveRow = { idx:number, side:string, p:number|null, q:number|null, player:string };
export type ReplayItem = { type:'MOVE'|'PASS', player:string, side?:'L'|'R'|'U'|'D', tile?:Tile };
export type State = { board: BoardState; hands: Tile[][]; players: Player[]; turn: number; target_score?: number|null; scores?: {name:string; score:number}[] };
