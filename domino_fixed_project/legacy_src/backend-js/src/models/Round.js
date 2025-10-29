import mongoose from 'mongoose';
const RoundSchema = new mongoose.Schema({
  match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
  ordinal: { type: Number, required: true },
  winner_player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
  gain: { type: Number, default: 0 },
  finished_at: { type: Date, default: null }
}, { versionKey: false });
RoundSchema.index({ match_id: 1, ordinal: 1 }, { unique: true });
export const Round = mongoose.model('Round', RoundSchema);
