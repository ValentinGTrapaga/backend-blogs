const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')

const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./blogtest_helper')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogsArray = helper.initialBlogs.map((blog) => new Blog(blog))
  const blogsPromisesArray = blogsArray.map((blog) => blog.save())
  await Promise.all(blogsPromisesArray)
})

describe('blogs', () => {
  test('are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('are returned correctly', async () => {
    const blogs = await helper.getBlogsFromDB()
    expect(blogs).toHaveLength(helper.initialBlogs.length)
  })

  test('contain a specific blog uploaded', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map((blog) => blog.title)
    expect(titles).toContain(helper.initialBlogs[0].title)
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

    await api.post('/api/blogs').send(newBlog).expect(400)
  })
})

describe('deletion of a blog', () => {
  test('can be done if provided right id', async () => {
    const blogs = await helper.getBlogsFromDB()
    const ids = blogs.map((blog) => blog.id)

    await api.delete(`/api/blogs/${ids[0]}`).expect(204)
    const blogsAtEnd = await helper.getBlogsFromDB()
    expect(blogsAtEnd).toHaveLength(blogs.length - 1)
  })

  test('cannot be done if provided wrong id', async () => {
    await api.delete('/api/blogs/1234').expect(400)
  })
})

describe('updation of a blog', () => {
  test('cannot be done if id is invalid', async () => {
    await api.put('/api/blogs/1234').expect(400)
  })

  test('can be done if id is valid', async () => {
    const blogs = await helper.getBlogsFromDB()
    expect(blogs[0].likes).not.toContain(650)

    const updatedBlog = { ...blogs[0], likes: 650 }
    console.log(updatedBlog)
    await api.put(`/api/blogs/${blogs[0].id}`).send(updatedBlog).expect(200)

    const blogsAtEnd = await helper.getBlogsFromDB()
    expect(blogsAtEnd[0].likes).toBe(650)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
