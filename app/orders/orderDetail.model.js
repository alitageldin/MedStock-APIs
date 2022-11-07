const mongoose = require('mongoose')

const OrderDetails = mongoose.Schema({
  ammount: {
    type: Number
  },
  quantity: {
    type: Number
  },
  discount: {
    type: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'orders',
    required: true,
  },
  sellerProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sellerproducts',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('orderdetails', OrderDetails)
