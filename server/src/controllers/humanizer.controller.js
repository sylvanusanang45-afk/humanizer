
import {
  generateVersions,
  refineVersion,
  analyzeVoice,
} from '../services/humanizer.service.js'

export async function generateText(req, res, next) {
  try {
    const {
      text,
      mode,
      voiceSamples,
      voiceProfile,
      instructions,
    } = req.body

    const versions = await generateVersions({
      text,
      mode,
      voiceSamples,
      voiceProfile,
      instructions,
    })

    return res.status(200).json({
      success: true,
      message: 'Your writing alternatives are ready.',
      data: { versions },
    })
  } catch (error) {
    next(error)
  }
}

export async function refineText(req, res, next) {
  try {
    const { text, mode, instruction } = req.body

    const refinedText = await refineVersion({
      text,
      mode,
      instruction,
    })

    return res.status(200).json({
      success: true,
      message: 'Your writing has been refined.',
      data: {
        content: refinedText,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function analyzeVoiceProfile(req, res, next) {
  try {
    const { samples } = req.body

    const profile = await analyzeVoice(samples)

    return res.status(200).json({
      success: true,
      message: 'Your writing voice has been analyzed.',
      data: { profile },
    })
  } catch (error) {
    next(error)
  }
}
