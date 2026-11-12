
export default function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200
    ? 500
    : res.statusCode

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong.',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  })
}
