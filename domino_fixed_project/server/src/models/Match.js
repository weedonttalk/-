import mongoose from 'mongoose'

const MoveSchema = new mongoose.Schema({
  playerId: String,
  type: { type: String, enum: ['move','draw','pass'], required: true },
  tile: { p: Number, q: Number, placement: String, direction: { type: String, enum: ['L','R','U','D', null], default: null } },
  createdAt: { type: Date, default: Date.now }
}, {_id:false})

const PlayerSchema = new mongoose.Schema({
  name: String,
  isBot: { type: Boolean, default: false },
  botType: { type: String, enum: ['heuristic','gpt', null], default: null }
}, {_id:false})

const MatchSchema = new mongoose.Schema({
  players: [PlayerSchema],
  stock: [[Number]],
  hands: { type: Map, of: [[Number]] },
  board: [[Number]],
  turnIndex: { type: Number, default: 0 },
  history: [MoveSchema],
  winner: { type: String, default: null }
}, { timestamps: true })

export const Match = mongoose.model('Match', MatchSchema)
