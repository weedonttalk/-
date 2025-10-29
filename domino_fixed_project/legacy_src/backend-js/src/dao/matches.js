import { Match } from '../models/Match.js';
import { MatchPlayer } from '../models/MatchPlayer.js';
import mongoose from 'mongoose';

export async function createMatch(target){
  const doc = await Match.create({ target_score: target ?? null });
  return doc.toObject();
}

export async function addMatchPlayer(matchId, playerId){
  await MatchPlayer.updateOne(
    { match_id: new mongoose.Types.ObjectId(matchId), player_id: new mongoose.Types.ObjectId(playerId) },
    { $setOnInsert: { score: 0 } },
    { upsert: true }
  );
}

export async function addScore(matchId, playerId, delta){
  await MatchPlayer.updateOne(
    { match_id: matchId, player_id: playerId },
    { $inc: { score: delta } }
  );
}

export async function getScores(matchId){
  const rows = await MatchPlayer.aggregate([
    { $match: { match_id: new mongoose.Types.ObjectId(matchId) } },
    { $lookup: { from: 'players', localField: 'player_id', foreignField: '_id', as: 'player' } },
    { $unwind: '$player' },
    { $project: { _id: 0, player_id: '$player._id', name: '$player.name', score: 1 } }
  ]);
  return rows;
}
