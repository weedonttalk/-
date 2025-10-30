import { Round } from '../models/Round.js';

export async function createRound(matchId, ordinal){
  const doc = await Round.create({ match_id: matchId, ordinal });
  return doc.toObject();
}

export async function finishRound(roundId, winnerPlayerId, gain){
  await Round.updateOne(
    { _id: roundId },
    { $set: { winner_player_id: winnerPlayerId, gain, finished_at: new Date() } }
  );
}
