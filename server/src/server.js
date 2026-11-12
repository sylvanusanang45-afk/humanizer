
import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Humanizer API running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
