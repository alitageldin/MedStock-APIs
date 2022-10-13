const mongoose = require('mongoose')
const { SOCIAL, PLATFORM } = require('../../helpers/constants')

const User = mongoose.Schema({
  firstName: {
    type: String,
    max: 30
  },
  lastName: {
    type: String,
    max: 30
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)
      },
      message: 'Please enter a valid email'
    },
    default: ''
  },
  authType: {
    type: String,
    enum: [SOCIAL, PLATFORM],
    default: PLATFORM
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'roles',
    required: true,
  },
  phone: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isProfileVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  signUpCompleted: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  dob: {
    type: Date
  },
  fcmToken: { type: String },
  heardFrom: {
    type: String,
    default: ''
  },
  paymentMethod: [{
    securityCode: String,
    expiry: String
  }],
  otp:
  {
    number: String,
    expiry: Date
  }

}, {
  timestamps: true
})

module.exports = mongoose.model('users', User)
