const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const helper = require('./test_helper')

jest.setTimeout(100000)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there is initially some blog posts saved', () => {
  test('correct amount of blog posts are returned as json', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

describe('addition of a new blog post', () => {
  test('a valid blog post can be added ', async () => {
    const newBlog = {
      title: 'test blog post for testing',
      author: 'tester',
      url: 'test.test',
      likes: 15,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  })

  test('if the likes property is missing from the request, it will default to the value 0', async () => {
    const newBlog = {
      title: 'test blog post for testing',
      author: 'tester',
      url: 'test.test',
    }

    const request = await api.post('/api/blogs').send(newBlog)
    expect(request.body.likes).toBe(0)
  })

  test('if title and url properties are missing, the backend responds with status code 400 Bad Request', async () => {
    const newBlog = {
      author: 'tester',
      likes: 100,
    }

    await api.post('/api/blogs').send(newBlog).expect(400)
  })
})

describe('deletion of a blog post', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((r) => r.title)

    expect(titles).not.toContain(blogToDelete.content)
  })
})

describe('updating of a blog post', () => {
  const updatedBlog = {
    title: 'Golden Troll',
    author: 'O.S. Leshev',
    url: 'http://golden.troll',
    likes: 0,
  }

  test('succeeds with status code 200 OK if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    expect(response.body.title).toBe(blogToUpdate.title)
    expect(response.body.likes).toBe(updatedBlog.likes)
  })

  test('succeeds with status code 200 OK and does not change the db if id is valid but is not in the db', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3y7bb59070281a82a3445'

    await api.put(`/api/blogs/${invalidId}`).send(updatedBlog).expect(400)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
