import mongoose from 'mongoose';
const MoveSchema = new mongoose.Schema({
  round_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Round', required: true, index: true },
  player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true, index: true },
  side: { type: String, enum: ['L','R','U','D','PASS'], required: true },
  p: { type: Number, default: null },
  q: { type: Number, default: null },
  idx_in_round: { type: Number, required: true, index: true },
  created_at: { type: Date, default: Date.now }
}, { versionKey: false });
MoveSchema.index({ round_id: 1, idx_in_round: 1 }, { unique: true });
export const Move = mongoose.model('Move', MoveSchema);
