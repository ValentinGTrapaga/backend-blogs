const config = require('./config')
const jwt = require('jsonwebtoken')

const userExtractor = (request, response, next) => {
  let token = ''
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    token = authorization.substring(7)
    const decodedTokenId = jwt.verify(token, config.SECRET)
    if (!decodedTokenId) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    request.userId = decodedTokenId.id
  }
  next()
}

module.exports = userExtractor
