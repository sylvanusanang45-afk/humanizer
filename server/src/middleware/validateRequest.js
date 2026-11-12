
import { z } from 'zod'

const modes = [
  'sound-like-me',
  'professional',
  'academic',
  'casual',
  'better-writer',
  'shorter-clearer',
  'persuasive',
]

const voiceProfileInputSchema = z.object({
  tone: z.string().max(500),
  formality: z.string().max(500),
  sentenceStyle: z.string().max(500),
  vocabulary: z.string().max(500),
  rhythm: z.string().max(500),
  personality: z.string().max(500),
  writingPatterns: z.array(z.string().max(300)).max(10),
  summary: z.string().max(1000),
})

const generationSchema = z.object({
  text: z.string()
    .trim()
    .min(20, 'Please enter at least 20 characters.')
    .max(10000, 'Your text cannot exceed 10,000 characters.'),

  mode: z.enum(modes),

  voiceSamples: z.array(
    z.string()
      .trim()
      .min(30, 'Each writing sample must contain at least 30 characters.')
      .max(3000, 'Each writing sample cannot exceed 3,000 characters.')
  ).max(5).optional().default([]),

  voiceProfile: voiceProfileInputSchema
    .nullable()
    .optional()
    .default(null),

  instructions: z.string()
    .trim()
    .max(1000, 'Additional instructions cannot exceed 1,000 characters.')
    .optional()
    .default(''),
})

const refinementSchema = z.object({
  text: z.string()
    .trim()
    .min(20, 'The text to refine must contain at least 20 characters.')
    .max(10000, 'The text cannot exceed 10,000 characters.'),

  mode: z.enum(modes),

  instruction: z.string()
    .trim()
    .min(3, 'Please provide a refinement instruction.')
    .max(1000, 'Your instruction cannot exceed 1,000 characters.'),
})

const voiceAnalysisSchema = z.object({
  samples: z.array(
    z.string()
      .trim()
      .min(30, 'Each writing sample must contain at least 30 characters.')
      .max(3000, 'Each writing sample cannot exceed 3,000 characters.')
  )
    .min(3, 'At least 3 writing samples are required.')
    .max(5, 'You can provide a maximum of 5 writing samples.'),
})

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Please check your input.',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    req.body = result.data
    next()
  }
}

export const validateGeneration = validate(generationSchema)
export const validateRefinement = validate(refinementSchema)
export const validateVoiceAnalysis = validate(voiceAnalysisSchema)
