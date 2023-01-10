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
  username:{
    type: String,
    max: 30,
    unique: true,
  },
  pharmacyName:{
    type: String,
    max: 30,
    default: ''
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
  phone: {
    type: String,
    default: '',
    unique: true
  },
  country: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  region: {
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
  ispendingApproval: {
    type: Boolean,
    default: false
  },
  isSeller:{
    type: Boolean,
    default: false
  },
  isBuyer:{
    type: Boolean,
    default: false
  },
  selectedProfile:{
    type: String,
    default: ''
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
  businessId: {
    type: String,
    default: ''
  },
  legalDocument1: {
    type: String,
    default: ''
  },
  legalDocument2: {
    type: String,
    default: ''
  },
  pharmacyLicense:{
    type: String,
    default: '' 
  },
  taxId:{
    type: String,
    default: '' 
  },
  legalDocumentVerify:{
    type: Boolean,
    default: false
  },
  paymentMethod: [{
    securityCode: String,
    expiry: String
  }],
  otp:
  {
    number: String,
    expiry: Date
  },
  viewedCount:{
    type: Number
  }

}, {
  timestamps: true
})

module.exports = mongoose.model('users', User)
