import { z } from 'zod'
import { Match } from '../models/Match.js'
import { makeSet, shuffle, deal, legalMoves, place, heuristicMove } from '../game/domino.js'
import { getOpenAI } from '../lib/openai.js'

export async function newMatch(req,res,next){
  try{
    const schema = z.object({
      players: z.array(z.object({
        name: z.string().min(1),
        isBot: z.boolean().optional().default(false),
        botType: z.enum(['heuristic','gpt']).nullable().optional()
      })).min(2).max(4),
      handSize: z.number().int().min(5).max(10).default(7)
    })
    const { players, handSize } = schema.parse(req.body)
    const set = shuffle(makeSet(6))
    const {hands, stock} = deal(set, players.length, handSize)
    const handsMap = {}
    players.forEach((p,i)=> handsMap[i] = hands[i])
    const match = await Match.create({
      players, stock, hands: handsMap, board: [], turnIndex: 0, history: []
    })
    res.json({ matchId: match._id.toString() })
  }catch(e){ next(e) }
}

export async function getState(req,res,next){
  try{
    const { matchId } = z.object({ matchId: z.string() }).parse(req.params)
    const m = await Match.findById(matchId).lean()
    if(!m) return res.status(404).json({error:'match not found'})
    res.json(m)
  }catch(e){ next(e) }
}

export async function postMove(req,res,next){
  try{
    const b = z.object({
      matchId: z.string(),
      playerIndex: z.number().int().nonnegative(),
      tile: z.tuple([z.number().int(), z.number().int()])
    }).parse(req.body)
    const m = await Match.findById(b.matchId)
    if(!m) return res.status(404).json({error:'match not found'})
    if(m.turnIndex !== b.playerIndex) return res.status(400).json({error:'not your turn'})
    const hand = m.hands.get(String(b.playerIndex)) || []
    const found = hand.find(t=>t[0]===b.tile[0] && t[1]===b.tile[1] || (t[0]===b.tile[1] && t[1]===b.tile[0]))
    if(!found) return res.status(400).json({error:'tile not in hand'})
    if(legalMoves(m.board, [b.tile]).length===0) return res.status(400).json({error:'illegal move'})
    m.board = place(m.board, b.tile)
    m.hands.set(String(b.playerIndex), hand.filter(t=>!(t[0]===found[0] && t[1]===found[1])))
    m.history.push({ playerId: String(b.playerIndex), type:'move', tile:{p:b.tile[0], q:b.tile[1]} })
    // check win
    if((m.hands.get(String(b.playerIndex))||[]).length===0){
      m.winner = String(b.playerIndex)
    }else{
      m.turnIndex = (m.turnIndex + 1) % m.players.length
    }
    await m.save()
    res.json({ok:true})
  }catch(e){ next(e) }
}

export async function postDraw(req,res,next){
  try{
    const b = z.object({ matchId: z.string(), playerIndex: z.number().int() }).parse(req.body)
    const m = await Match.findById(b.matchId)
    if(!m) return res.status(404).json({error:'match not found'})
    if(m.stock.length===0) return res.status(400).json({error:'stock empty'})
    const t = m.stock.shift()
    const hand = m.hands.get(String(b.playerIndex)) || []
    hand.push(t)
    m.hands.set(String(b.playerIndex), hand)
    m.history.push({ playerId:String(b.playerIndex), type:'draw', tile:{p:t[0], q:t[1]} })
    await m.save()
    res.json({ tile: t })
  }catch(e){ next(e) }
}

export async function postPass(req,res,next){
  try{
    const b = z.object({ matchId: z.string(), playerIndex: z.number().int() }).parse(req.body)
    const m = await Match.findById(b.matchId)
    if(!m) return res.status(404).json({error:'match not found'})
    m.history.push({ playerId:String(b.playerIndex), type:'pass', tile:null })
    m.turnIndex = (m.turnIndex + 1) % m.players.length
    await m.save()
    res.json({ok:true})
  }catch(e){ next(e) }
}

export async function postBotLocal(req,res,next){
  try{
    const { matchId } = z.object({ matchId: z.string() }).parse(req.body)
    const m = await Match.findById(matchId)
    if(!m) return res.status(404).json({error:'match not found'})
    const idx = m.turnIndex
    const hand = m.hands.get(String(idx)) || []
    const mv = heuristicMove(m.board, hand)
    if(!mv) return res.json({ move: null })
    res.json({ move: mv })
  }catch(e){ next(e) }
}

export async function postBotOpenAI(req,res,next){
  try{
    const { matchId } = z.object({ matchId: z.string() }).parse(req.body)
    const m = await Match.findById(matchId).lean()
    if(!m) return res.status(404).json({error:'match not found'})
    const idx = m.turnIndex
    const hand = m.hands[String(idx)] || []
    const client = getOpenAI()
    const prompt = `You play Russian domino (double-six). Board: ${JSON.stringify(m.board)}. 
Your hand tiles as [a,b]: ${JSON.stringify(hand)}. Return only ONE tile from your hand as JSON array [a,b] that you want to play. 
If no legal moves, return null.`
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role:'user', content: prompt }],
      temperature: 0.2
    })
    let text = resp.choices?.[0]?.message?.content?.trim() || 'null'
    let move = null
    try{ move = JSON.parse(text) }catch{ move = null }
    res.json({ move })
  }catch(e){ next(e) }
}
