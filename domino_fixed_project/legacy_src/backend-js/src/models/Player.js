import mongoose from 'mongoose';
const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  is_bot: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, { versionKey: false });
export const Player = mongoose.model('Player', PlayerSchema);
