require('dotenv').config()
const mongoose = require('mongoose')
const config = require('../utils/config')

const url = config.MONGODB_URI

mongoose
  .connect(url)
  .then((res) => {
    console.log('Connected to database')
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err.message)
  })

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: {
    type: String,
    required: true
  },
  url: String,
  likes: Number,
  date: Date
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)
