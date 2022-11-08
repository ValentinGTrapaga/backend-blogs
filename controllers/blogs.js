const Blog = require('../models/blog.js')
const User = require('../models/user.js')

const userExtractor = require('../utils/userExtractor')

const blogRouter = require('express').Router()

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1 })
  response.json(blogs)
})

blogRouter.get('/:id', async (req, res) => {
  const id = req.params.id
  const blog = await Blog.findById(id).populate('user', {
    username: 1
  })
  blog ? res.json(blog) : res.status(404).end()
})

blogRouter.delete('/:id', userExtractor, async (req, res) => {
  const id = req.params.id
  const { userId } = req
  const blog = await Blog.findById(id)

  if (!blog) {
    return res.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== userId) {
    res.status(401).json({ error: 'unauthorized' })
  }

  await blog.delete()
  return res.status(200).end()
})

blogRouter.post('/', userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body
  const { userId } = request

  const user = await User.findById(userId)

  const blogToSave = new Blog({ title, author, url, likes, user })

  const result = await blogToSave.save()
  user.blogs = user.blogs.concat(result._id)
  await user.save()

  response.status(201).json(result)
})

blogRouter.put('/:id', userExtractor, async (req, res, next) => {
  const { title, author, url, likes } = req.body
  const { userId } = req

  const user = await User.findById(userId)

  const id = req.params.id
  const blogToAdd = { title, author, url, likes, id, user }
  const blogUpdated = await Blog.findByIdAndUpdate(id, blogToAdd, {
    new: true,
    runValidators: true,
    context: 'query'
  })

  user.blogs = user.blogs.concat(blogUpdated._id)
  await user.save()

  res.json(blogUpdated)
})

module.exports = blogRouter
