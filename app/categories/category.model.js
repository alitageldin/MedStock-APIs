const mongoose = require('mongoose')

const Category = mongoose.Schema({
  title: {
    type: String,
    required: true,
    mn: [3, 'Must be at least 3, got {VALUE}'],
    unique: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('categories', Category)
