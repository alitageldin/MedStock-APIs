const mongoose = require('mongoose')

const Product = mongoose.Schema({
  title: {
    type: String
  },
  imageUrl: {
    type: String
  },
  description: {
    type: String
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('promotions', Product)
