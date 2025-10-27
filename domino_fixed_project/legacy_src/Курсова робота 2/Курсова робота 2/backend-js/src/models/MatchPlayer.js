import mongoose from 'mongoose';
const MatchPlayerSchema = new mongoose.Schema({
  match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
  player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true, index: true },
  score: { type: Number, default: 0 }
}, { versionKey: false });
MatchPlayerSchema.index({ match_id: 1, player_id: 1 }, { unique: true });
export const MatchPlayer = mongoose.model('MatchPlayer', MatchPlayerSchema);
