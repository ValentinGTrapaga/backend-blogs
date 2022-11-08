const Blog = require('../models/blog')
const User = require('../models/user')

const getBlogsFromDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const getUsersFromDB = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

module.exports = { getBlogsFromDB, getUsersFromDB }
