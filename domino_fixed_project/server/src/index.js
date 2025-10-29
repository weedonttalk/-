import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { connectDB } from './lib/db.js'
import { router as api } from './routes/api.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/',(_req,res)=>res.json({ok:true, service:'domino-server'}))
app.use('/api', api)
app.use(errorHandler)

const PORT = Number(process.env.PORT||5050)

connectDB().then(()=>{
  app.listen(PORT, ()=> console.log(`[server] listening on http://localhost:${PORT}`))
}).catch(err=>{
  console.error('[server] failed to connect to database:', err.message)
  process.exit(1)
})
