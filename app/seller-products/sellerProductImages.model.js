const mongoose = require('mongoose')

const sellerProductImages = mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  sellerProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sellerproducts',
    required: true,
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('sellerproductimages', sellerProductImages)
