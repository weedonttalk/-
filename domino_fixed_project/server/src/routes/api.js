import { Router } from 'express'

import { healthController } from "../controllers"
import { newMatch, getState, postMove, postDraw, postPass, postBotLocal, postBotOpenAI } from '../controllers/gameController.js'

export const router = Router()
router.get('/health', healthController)
router.post('/new', newMatch)
router.get('/state/:matchId', getState)
router.post('/move', postMove)
router.post('/draw', postDraw)
router.post('/pass', postPass)
router.post('/bot', postBotLocal)
router.post('/bot/openai', postBotOpenAI)
