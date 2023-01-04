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
  },
  type:{
    type: String,
    default: 'image'
  },
  videoLink:{
    type: String
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories'
  },
  productId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('promotions', Product)
