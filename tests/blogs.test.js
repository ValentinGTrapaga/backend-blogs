const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

const helper = require('./blogtest_helper')

let token = 'bearer '

beforeAll(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const newUser = {
    username: 'root',
    name: 'Root User',
    password: 'sekret'
  }

  const testLoginUser = {
    username: 'root',
    password: 'sekret'
  }

  const blogAtBeginning = await helper.getBlogsFromDB()
  console.log('blogAtBeginning', blogAtBeginning)
  expect(blogAtBeginning).toHaveLength(0)

  await api.post('/api/users').send(newUser).expect(201)
  const loginInfo = await api.post('/api/login').send(testLoginUser).expect(200)
  token += loginInfo.body.token

  const promisesArr = helper.initialBlogs.map(async (newBlog) => {
    return await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
  })
  await Promise.all(promisesArr)

  const blogsFinals = await helper.getBlogsFromDB()
  expect(blogsFinals).toHaveLength(helper.initialBlogs.length)
})

describe('blogs', () => {
  test('are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
})

describe('addition of a blog', () => {
  test('can be done if valid info', async () => {
    const newBlog = {
      title: 'Lets go',
      author: 'Valentin Gonzalez Trapaga',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ authorization: token })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.getBlogsFromDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map((blog) => blog.title)
    expect(contents).toContain(newBlog.title)
  })

  test('cannot be done if not valid info', async () => {
    const newBlog = {
      title: 'Lets go',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ authorization: token })
      .expect(400)
  })

  test('cannot be done if not valid token', async () => {
    const newBlog = {
      title: 'Lets go',
      author: 'Valentin Gonzalez Trapaga',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ authorization: 'qwe123124asda' })
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  beforeEach(async () => {
    const newBlog = {
      title: 'Lets go',
      author: 'Valentin Gonzalez Trapaga',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 0
    }

    await api.post('/api/blogs').send(newBlog).set({ authorization: token })
  })
  test('succeeds if provided right id and token', async () => {
    const blogs = await helper.getBlogsFromDB()
    const blog = await Blog.findOne({ title: 'Lets go' })

    await api
      .delete(`/api/blogs/${blog.id}`)
      .set({ authorization: token })
      .expect(200)
    const blogsAtEnd = await helper.getBlogsFromDB()
    expect(blogsAtEnd).toHaveLength(blogs.length - 1)
  })

  test('cannot be done if provided wrong id', async () => {
    await api
      .delete('/api/blogs/1234')
      .set({ authorization: token })
      .expect(400)
  })

  test('cannot be done if provided wrong token', async () => {
    const blog = await Blog.findOne({ title: 'Lets go' })

    await api
      .delete(`/api/blogs/${blog.id}`)
      .set({ authorization: 'bearer 12312312412512' })
      .expect(400)
  })
})

describe('updation of a blog', () => {
  const newBlog = {
    title: 'Lets go',
    author: 'Valentin Gonzalez Trapaga',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 0
  }

  beforeEach(async () => {
    await api.post('/api/blogs').send(newBlog).set({ authorization: token })
  })

  test('fails if id is invalid', async () => {
    await api.put('/api/blogs/1234').expect(400)
  })

  test('fails if token is invalid', async () => {
    const blog = await Blog.findOne({ title: 'Lets go' })

    const updatedBlog = {
      title: 'Trying to update the blog',
      author: 'Valentin Gonzalez Trapaga',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 0
    }

    await api
      .put(`/api/blogs/${blog.id}`)
      .send(updatedBlog)
      .set({ authorization: 'bearer 123125412312' })
      .expect(400)
  })

  test('succeeds if id and token is valid', async () => {
    const blog = await Blog.findOne({ title: 'Lets go' })

    const updatedBlog = {
      title: 'Updating the blog...',
      author: 'Valentin Gonzalez Trapaga',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 0
    }

    await api
      .put(`/api/blogs/${blog.id}`)
      .send(updatedBlog)
      .set({ authorization: token })
      .expect(200)

    const finalBlog = await Blog.findOne({ title: updatedBlog.title })
    expect(finalBlog.title).toContain('Updating the blog...')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
