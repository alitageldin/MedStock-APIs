const mongoose = require('mongoose')

const Refunds = mongoose.Schema({
  description: {
    type: String
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'orderdetails'
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  sellerProductId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sellerproducts'
  },
  ratingCount:{
    type: Number
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('ratings', Refunds)
