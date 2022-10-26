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
    type: Number
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('products', Product)
