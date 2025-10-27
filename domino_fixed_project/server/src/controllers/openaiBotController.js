import { z } from 'zod'
import { getService } from '../services/gameService.js'
import { getOpenAI } from '../lib/openai.js'

function systemPrompt(){
  return `You are a Domino (Double-Six) assistant that chooses a single legal move.
Board has center and four branches: L,R,U,D. A branch end value must match either pip of the tile.
If no legal move exists for the given hand and current branch ends, reply with {"action":"draw_or_pass"}.
Otherwise reply strictly as JSON: {"action":"move","side":"L|R|U|D","handIndex":NUMBER}.
Do not include any prose.`
}

function buildUserMessage(snapshot, hand){
  // snapshot: {board:{ends:{L,R,U,D}}, ...}
  const ends = snapshot.board.ends
  return {
    role: 'user',
    content: JSON.stringify({ ends, hand })
  }
}

export async function postBotOpenAI(req, res){
  const schema = z.object({ matchId: z.string() })
  const { matchId } = schema.parse(req.body)
  const srv = getService(matchId)
  const pl = srv.players[srv.turnIndex]
  const client = getOpenAI()
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt() },
      buildUserMessage(srv.snapshot(), pl.hand.map(t=>[t.p,t.q]))
    ],
    temperature: 0
  }
  // Use Chat Completions for compatibility
  const resp = await client.chat.completions.create(body)
  const text = resp.choices?.[0]?.message?.content?.trim() || '{}'
  let parsed = null
  try { parsed = JSON.parse(text) } catch{ parsed = { action:'draw_or_pass' } }
  res.json({ move: parsed })
}
