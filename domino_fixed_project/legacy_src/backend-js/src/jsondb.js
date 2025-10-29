import fs from 'fs';
const DB_PATH = process.env.JSON_DB_PATH || 'domino.json';
let cache = null;
function def(){ return { players:[], matches:[], match_players:[], rounds:[], moves:[], seq:{player:0,match:0,round:0,move:0} }; }
export function initJsonDb(){
  if(!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify(def(), null, 2), 'utf-8');
  cache = JSON.parse(fs.readFileSync(DB_PATH,'utf-8')); cache.seq = cache.seq || {player:0,match:0,round:0,move:0};
}
export function db(){ if(!cache) throw new Error('JSON DB not initialized'); return cache; }
export function save(){ const tmp=DB_PATH+'.tmp'; fs.writeFileSync(tmp, JSON.stringify(cache,null,2), 'utf-8'); fs.renameSync(tmp, DB_PATH); }
export function nextId(kind){ if(cache.seq[kind]===undefined) cache.seq[kind]=0; cache.seq[kind]+=1; return cache.seq[kind]; }
