const { boolean } = require('joi')
const mongoose = require('mongoose')

const Feedback = mongoose.Schema({
  subject: {
    type: String
  },
  isSeller:{
    type: Boolean,
    default: false
  },
  isBuyer:{
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  message: {
    type: String
  },
  imageUrl: {
    type: String
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('feedbacks', Feedback)
