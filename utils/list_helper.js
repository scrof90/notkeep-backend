const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => sum + blog.likes

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return {}

  const sorter = (blog1, blog2) => blog2.likes - blog1.likes

  const favorite = blogs.sort(sorter)[0]

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return {}

  const countedAuthors = _.countBy(blogs, 'author')
  const authorsWithBlogs = Object.keys(countedAuthors).map((key) => ({ author: key, blogs: countedAuthors[key] }))
  const orderedAuthorsWithBlogs = _.orderBy(authorsWithBlogs, 'blogs', 'desc')

  return _.head(orderedAuthorsWithBlogs)
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return {}

  const authorsWithLikes = _
    .uniqBy(blogs, 'author')
    .map((a) => {
      const author = a.author
      const likes = blogs.reduce((acc, curr) => {
        if (curr.author === author) return acc + curr.likes
        return acc
      }, 0)

      return {
        author,
        likes,
      }
    })
  const orderedAuthorsWithLikes = _.orderBy(authorsWithLikes, 'likes', 'desc')

  return _.head(orderedAuthorsWithLikes)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}