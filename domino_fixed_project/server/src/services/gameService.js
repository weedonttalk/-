import { RoundService } from '../engine/roundService.js'
import { Player } from '../models/Player.js'
import { Match } from '../models/Match.js'
import { MatchPlayer } from '../models/MatchPlayer.js'
import { Round } from '../models/Round.js'

// In-memory map of active rounds (persisted journal optional)
const sessions = new Map()

export async function createMatch({targetScore, players}){
  const savedPlayers = await Player.insertMany(players)
  const match = await Match.create({targetScore})
  await MatchPlayer.insertMany(savedPlayers.map(p=>({matchId:match._id, playerId:p._id, score:0})))
  const round = await Round.create({matchId:match._id, ordinal:1})
  const service = new RoundService(savedPlayers.map(p=>({_id:p._id.toString(), name:p.name, isBot:p.isBot})))
  sessions.set(match._id.toString(), {service, matchId:match._id.toString(), roundId:round._id.toString()})
  return {match, round, players:savedPlayers, service}
}

export function getService(matchId){
  const ctx = sessions.get(matchId)
  if(!ctx) throw Object.assign(new Error('Match not found'), {status:404})
  return ctx.service
}
