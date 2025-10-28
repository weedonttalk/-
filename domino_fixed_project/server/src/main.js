import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import signale from 'signale'

import { router as api } from './routes/api.js'
import { mongoConnect, mongoDisconnect } from './lib/db.js'
import { errorHandler } from './middleware/errorHandler.js'

import {CONFIG} from './config'

// handle gracefull shutdown
const shutdown = async () => {
    signale.info("[SERVER] shuting down")
    await mongoDisconnect()
    process.exit(0);
}

// main function to start the servr
const bootstrap  = async () => {
    // app initialization
    const app = express()
    // middlewares
    app.use(cors())
    app.use(express.json())
    app.use(morgan('dev'))
    app.use('/api', api)
    app.use(errorHandler)

    // emdpoints
    app.get('/',(_req,res)=>res.json({ok:true, service:'domino-server'}))

    try {
        await mongoConnect()
        app.listen(CONFIG.port, ()=> signale.info(`[SERVER] listening on http://localhost:${CONFIG.port}`))
    } catch (e) {
        signale.error("[SERVER] server startap error", e)
        process.exit(1)
    }

    // handle close signals
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

bootstrap()


