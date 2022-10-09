
const User = require('../app/users/user.model')
const Roles = require('../app/roles/role.model')
const bcrypt = require('bcrypt')
const { USER_fullname, USER_firstName, USER_lastName, USER_authType, USER_email, USER_isEmailVerified, 
USER_isPhoneVerified, USER_password, USER_signUpCompleted, User_role } = require('../helpers/constants')
require('dotenv').config()
exports.seedSeller = async () => {
  await User.deleteMany()
  const salt = await bcrypt.genSalt(10)
  const roleSA = await Roles.findOne({ title: User_role })
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
    userType: roleSA._id
  })
  await sellerUser.save()
  console.log('Seller user created succesfully')
}

// async function seedData () {
//   await mongoose.connect(process.env.MONGO_URI, async (err, r) => {
//     if (!err) {
//       console.log('mongoDB connected successfully to ' + process.env.MONGO_URI)
//       await seedSuperAdmin()
//     }
//   })
// }
// seedData()
