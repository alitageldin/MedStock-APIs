const mongoose = require('mongoose')

const Refunds = mongoose.Schema({
  reason: {
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
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('refunds', Refunds)
