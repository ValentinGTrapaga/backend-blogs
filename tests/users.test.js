const supertest = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')

const api = supertest(app)

const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./blogtest_helper')

describe('when there is one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with correct data', async () => {
    const usersAtStart = await helper.getUsersFromDB()

    const newUser = {
      username: 'valegt22',
      name: 'Valentin G Trapaga',
      password: 'valeGTPRO26'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.getUsersFromDB()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((user) => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails if data is username or password too short', async () => {
    const usersAtStart = await helper.getUsersFromDB()

    const newUser = {
      username: 'v',
      name: 'Valentin G Trapaga',
      password: ''
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.getUsersFromDB()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    expect(result.body.error).toContain(
      'username and password must be at least 3 characters long'
    )
  })

  test('creation fails if username is not unique', async () => {
    const usersAtStart = await helper.getUsersFromDB()

    const newUser = {
      username: 'root',
      name: 'Valentin G Trapaga',
      password: '1234151'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.getUsersFromDB()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    expect(result.body.error).toContain('username must be unique')
  })
})

describe('creating one user in db', () => {
  const newUser = {
    username: 'root',
    name: 'Root User',
    password: 'sekret'
  }

  const testLoginUser = {
    username: 'root',
    password: 'sekret'
  }

  const wrongUser = {
    username: 'root',
    password: 'secret'
  }

  beforeEach(async () => {
    await User.deleteMany({})

    await api.post('/api/users').send(newUser).expect(201)
  })
  test('login suceeds if correct data is sent', async () => {
    await api.post('/api/login').send(testLoginUser).expect(200)
  })

  test('login fails if incorrect data is sent', async () => {
    await api.post('/api/login').send(wrongUser).expect(401)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
