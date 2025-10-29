import mongoose from 'mongoose'
const MatchPlayerSchema = new mongoose.Schema({
  matchId:{type:mongoose.Schema.Types.ObjectId, ref:'Match', index:true, required:true},
  playerId:{type:mongoose.Schema.Types.ObjectId, ref:'Player', required:true},
  score:{type:Number, default:0}
},{timestamps:true})
MatchPlayerSchema.index({matchId:1, playerId:1}, {unique:true})
export const MatchPlayer = mongoose.model('MatchPlayer', MatchPlayerSchema)
