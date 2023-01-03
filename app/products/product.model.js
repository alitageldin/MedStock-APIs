const { boolean } = require('joi')
const mongoose = require('mongoose')

const Product = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sku: {
    type: String
  },
  imageUrl: {
    type: String,
    default: "images/admin-product-images/medical.jpg"
  },
  price: {
    type: Number
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories'
  },
  description: {
    type: String
  },
  isDeleted:{
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('products', Product)
