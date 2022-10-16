const mongoose = require('mongoose')

const ProductImage = mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('productimages', ProductImage)
