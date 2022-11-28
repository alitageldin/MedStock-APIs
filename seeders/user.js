
const User = require('../app/users/user.model')
const Roles = require('../app/roles/role.model')
const bcrypt = require('bcrypt')
const { USER_fullname, USER_firstName, USER_lastName, USER_email, USER_isEmailVerified, 
USER_isPhoneVerified, USER_password, USER_PHONE, USER_ADDRESS, USER_signUpCompleted, SELLER, USER_PHARMACYNAME, USER_BUSINESSID } = require('../helpers/constants')
require('dotenv').config()
exports.seedSeller = async () => {
  await User.deleteMany()
  const salt = await bcrypt.genSalt(10)
  const roleSE = await Roles.findOne({ title: SELLER})
  const sellerUser = new User({
    firstName : USER_firstName, 
    lastName : USER_lastName, 
    authType : 'platform', 
    isEmailVerified : USER_isEmailVerified, 
    isPhoneVerified : USER_isPhoneVerified, 
    signUpCompleted: USER_signUpCompleted, 
    password: await bcrypt.hash(USER_password, salt), 
    fullName: USER_fullname,
    email: USER_email,
    businessId: USER_BUSINESSID,
    address: USER_ADDRESS,
    pharmacyName: USER_PHARMACYNAME,
    phone: USER_PHONE,
    role: roleSE._id
  })
  await sellerUser.save()
}