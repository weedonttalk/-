import mongoose from 'mongoose'
import { config } from '../config/index.js'

export async function connectDB(){
  const uri = config.mongoUri
  mongoose.set('strictQuery', true)
  try{
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    })
    console.log('[db] connected to', uri)
  }catch(e){
    console.error('[db] connection error:', e.message)
    throw e
  }
}
