const Blog = require('../models/blog.js')
const blogRouter = require('express').Router()

blogRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

blogRouter.get('/:id', (req, res, next) => {
  const id = req.params.id
  Blog.findById(id)
    .then((blog) => {
      blog ? res.json(blog) : res.status(404).end()
    })
    .catch((err) => next(err))
})

blogRouter.delete('/:id', (req, res, next) => {
  const id = req.params.id
  Blog.findByIdAndDelete(id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

blogRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  blog.save().then((result) => {
    response.status(201).json(result)
  })
})

blogRouter.put('/:id', (req, res, next) => {
  const body = req.body
  const id = req.params.id
  const blogToAdd = { ...body, id }
  Blog.findByIdAndUpdate(id, blogToAdd, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then((result) => {
      res.json(result)
    })
    .catch((err) => next(err))
})

module.exports = blogRouter
