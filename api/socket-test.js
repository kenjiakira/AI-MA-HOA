// Vercel serverless function for testing socket connections

module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Socket.IO API endpoint is responding',
    timestamp: new Date().toISOString()
  });
};
