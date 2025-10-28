import 'dotenv/config'

export const CONFIG = {
  port: Number(process.env.PORT||5050),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/domino',
  ai: {
    timeoutMs: Number(process.env.AI_TIMEOUT_MS||4000)
  }
}

if(!CONFIG.mongoUri){
  console.warn('[config] MONGODB_URI not set — using default mongodb://127.0.0.1:27017/domino')
}
