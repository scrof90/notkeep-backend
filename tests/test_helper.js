const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'Golden Troll',
    author: 'O.S. Leshev',
    url: 'http://golden.troll',
    likes: 100,
  },
  {
    title: 'Rats',
    author: 'G.N. Prikolov',
    url: 'http://prikol.off',
    likes: 13,
  },
  {
    title: 'Pigs',
    author: 'E. Svinaryov',
    url: 'http://svinar.nik',
    likes: 0,
  },
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'willremovethissoon',
    author: 'tester',
    url: 'http://localhost',
    likes: '20',
  })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
}
