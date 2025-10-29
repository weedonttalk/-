import { Move } from '../models/Move.js';

export async function logMove(roundId, playerId, side, p, q, idx){
  await Move.create({ round_id: roundId, player_id: playerId, side, p, q, idx_in_round: idx });
}

export async function movesForRound(roundId){
  const rows = await Move.find({ round_id: roundId }).sort({ idx_in_round: 1 }).lean();
  return rows;
}
