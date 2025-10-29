import mongoose from 'mongoose'
const PlayerSchema = new mongoose.Schema({
  name:{type:String, required:true, trim:true},
  isBot:{type:Boolean, default:false}
},{timestamps:true})
export const Player = mongoose.model('Player', PlayerSchema)
