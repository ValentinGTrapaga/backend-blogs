const totalLikes = (blogs) => {
  if (!Array.isArray(blogs)) return null
  if (blogs.length === 0) return 0
  const likes = blogs.reduce((total, currBlog) => {
    return total + currBlog.likes
  }, 0)
  return likes
}

const favoriteBlog = (blogs) => {
  if (!Array.isArray(blogs)) return null
  if (blogs.length === 0) return null
  let mostLikedBlog = blogs[0]
  blogs.forEach((blog) => {
    if (blog.likes > mostLikedBlog.likes) {
      mostLikedBlog = blog
    }
  })
  return mostLikedBlog
}

module.exports = { favoriteBlog, totalLikes }
