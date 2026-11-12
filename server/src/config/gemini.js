
import { GoogleGenAI } from '@google/genai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing. Check your server/.env file.')
}

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || 'gemini-2.5-flash'

export default gemini
