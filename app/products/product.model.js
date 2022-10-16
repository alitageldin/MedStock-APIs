const mongoose = require('mongoose')

const Product = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date
  },
  price: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories'
  },
  notes: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('products', Product)
