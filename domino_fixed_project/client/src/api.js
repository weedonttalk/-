const host = (typeof window!=='undefined' && window.location.hostname) ? window.location.hostname : 'localhost'
const API = (p)=>`http://${host}:5050/api${p}`

export const newGame = (payload)=> fetch(API('/new'),{
  method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
}).then(r=>r.json())

export const state = (id)=> fetch(API(`/state/${id}`)).then(r=>r.json())

export const move = (b)=> fetch(API('/move'),{
  method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(b)
}).then(r=>r.json())

export const draw = (b)=> fetch(API('/draw'),{
  method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(b)
}).then(r=>r.json())

export const passApi = (matchId, playerIndex)=> fetch(API('/pass'),{
  method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({matchId, playerIndex})
}).then(r=>r.json())

export const botSuggestHeuristic = (matchId)=> fetch(API('/bot'),{
  method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({matchId})
}).then(r=>r.json())

export const botSuggestOpenAI = (matchId)=> fetch(API('/bot/openai'),{
  method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({matchId})
}).then(r=>r.json())
