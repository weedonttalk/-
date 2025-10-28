import mongoose from 'mongoose'
import signale from 'signale'

import { CONFIG } from '../config'

// connect to the mongo
export async function mongoConnect(){
  const uri = CONFIG.mongoUri
  mongoose.set('strictQuery', true)
  try{
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    })
    signale.info('[DB] connected to', uri)
  }catch(e){
    signale.error('[DB] connection error:', e.message)
    throw e
  }
}

// close connection to mongo database
export const mongoDisconnect = async () => {
    try {
        if (mongoose.connection.readyState) {
            await mongoose.disconnect()
            signale.info("[DB] mongo connection closed successfully")
        }
    } catch (e) {
        signale.error("[DB] cannot disconnect mongo")
    }
}
