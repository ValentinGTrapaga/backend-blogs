const Blog = require('../models/blog.js')
const blogRouter = require('express').Router()

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1
  })
  console.log(blogs)
  response.json(blogs)
})

blogRouter.get('/:id', async (req, res) => {
  const id = req.params.id
  const blog = await Blog.findById(id).populate('user', {
    username: 1
  })
  blog ? res.json(blog) : res.status(404).end()
})

blogRouter.delete('/:id', async (req, res) => {
  const id = req.params.id
  await Blog.findByIdAndDelete(id)
  res.status(204).end()
})

blogRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  const result = await blog.save()
  response.status(201).json(result)
})

blogRouter.put('/:id', async (req, res, next) => {
  const body = req.body
  const id = req.params.id
  const blogToAdd = { ...body, id }
  const blogAdded = await Blog.findByIdAndUpdate(id, blogToAdd, {
    new: true,
    runValidators: true,
    context: 'query'
  })
  res.json(blogAdded)
})

module.exports = blogRouter
