const mongoose = require('mongoose')

const Orders = mongoose.Schema({
  totalAmmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number
  },
  userId: {
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

module.exports = mongoose.model('orders', Orders)
