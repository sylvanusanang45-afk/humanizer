export default async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Please sign in to use Humanizer.',
    })
  }

  const token = authorization.slice(7)
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase backend environment variables are missing.')

    return res.status(500).json({
      success: false,
      message: 'Authentication service is not configured.',
    })
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return res.status(401).json({
        success: false,
        message: 'Your session is invalid or expired. Please sign in again.',
      })
    }

    const authenticatedUser = await response.json()

    if (!authenticatedUser?.id) {
      return res.status(401).json({
        success: false,
        message: 'Unable to verify your account.',
      })
    }

    req.user = authenticatedUser
    next()
  } catch (error) {
    console.error('Authentication verification failed:', error.message)

    return res.status(503).json({
      success: false,
      message: 'Authentication service is temporarily unavailable.',
    })
  }
}