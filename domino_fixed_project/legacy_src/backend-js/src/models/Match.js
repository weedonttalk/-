import mongoose from 'mongoose';
const MatchSchema = new mongoose.Schema({
  target_score: { type: Number, default: null },
  started_at: { type: Date, default: Date.now },
  finished_at: { type: Date, default: null }
}, { versionKey: false });
export const Match = mongoose.model('Match', MatchSchema);
