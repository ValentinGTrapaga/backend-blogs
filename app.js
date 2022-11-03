const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('express-async-errors')
const blogRouter = require('./controllers/blogs')
const errorHandler = require('./utils/errorHandler')
const unknownEndpoint = require('./utils/unknownEndpoint')

const app = express()

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms - body: :body'
  )
)
app.use(cors())

app.get('/', (req, res) => {
  res.send('<h1>Hello from the blog server</h1>')
})

app.use('/api/blogs', blogRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app
