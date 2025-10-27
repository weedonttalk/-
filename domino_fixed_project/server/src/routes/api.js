import { Router } from 'express'
import { newMatch, getState, postMove, postDraw, postPass, postBotLocal, postBotOpenAI } from '../controllers/gameController.js'

export const router = Router()
router.get('/health', (_req,res)=>res.json({ok:true}))
router.post('/new', newMatch)
router.get('/state/:matchId', getState)
router.post('/move', postMove)
router.post('/draw', postDraw)
router.post('/pass', postPass)
router.post('/bot', postBotLocal)
router.post('/bot/openai', postBotOpenAI)
