
import { Router } from 'express'

import {
  generateText,
  refineText,
  analyzeVoiceProfile,
} from '../controllers/humanizer.controller.js'

import {
  validateGeneration,
  validateRefinement,
  validateVoiceAnalysis,
} from '../middleware/validateRequest.js'

const router = Router()

router.post('/generate', validateGeneration, generateText)
router.post('/refine', validateRefinement, refineText)
router.post('/analyze-voice', validateVoiceAnalysis, analyzeVoiceProfile)

export default router
