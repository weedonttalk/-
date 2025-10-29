import { Player } from '../models/Player.js';

export async function upsertPlayer(name, isBot){
  const doc = await Player.findOneAndUpdate(
    { name },
    { $setOnInsert: { name, is_bot: !!isBot } },
    { upsert: true, new: true }
  ).lean();
  return doc;
}

export async function findPlayerByName(name){
  return await Player.findOne({ name }).lean();
}

export async function listPlayers(){
  return await Player.find().sort({ _id: 1 }).lean();
}
