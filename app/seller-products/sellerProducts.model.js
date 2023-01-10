const mongoose = require('mongoose')

const SellerProducts = mongoose.Schema({
  expiryDate: {
    type: Date
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number
  },
  remainingQuantity: {
    type: Number
  },
  minOrderQuantity:{
    type: Number,
    default: 0
  },
  maxOrderQuantity:{
    type: Number,
    default: 0
  },
  discount: {
    type: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories'
  },
  notes: {
    type: String
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  viewedCount:{
    type: Number,
    default: 0
  },
  
}, {
  timestamps: true
})

module.exports = mongoose.model('sellerproducts', SellerProducts)
