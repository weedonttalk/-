import mongoose from 'mongoose'
const MoveSchema = new mongoose.Schema({
  roundId:{type:mongoose.Schema.Types.ObjectId, ref:'Round', index:true, required:true},
  playerId:{type:mongoose.Schema.Types.ObjectId, ref:'Player', required:true},
  idx:{type:Number, required:true},
  side:{type:String, enum:['L','R','U','D','PASS'], required:true},
  p:{type:Number},
  q:{type:Number},
  createdAt:{type:Date, default:Date.now}
})
MoveSchema.index({roundId:1, idx:1}, {unique:true})
export const Move = mongoose.model('Move', MoveSchema)
