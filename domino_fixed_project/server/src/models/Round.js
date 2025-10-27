import mongoose from 'mongoose'
const RoundSchema = new mongoose.Schema({
  matchId:{type:mongoose.Schema.Types.ObjectId, ref:'Match', index:true, required:true},
  ordinal:{type:Number, required:true},
  winnerPlayerId:{type:mongoose.Schema.Types.ObjectId, ref:'Player'},
  gain:{type:Number, default:0},
  finishedAt:{type:Date}
},{timestamps:true})
RoundSchema.index({matchId:1, ordinal:1}, {unique:true})
export const Round = mongoose.model('Round', RoundSchema)
