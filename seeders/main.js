const mongoose = require('mongoose')
const { seedSuperAdmin } = require('./admin')
const { seedPerms } = require('./permissions')
const { seedRole } = require('./role')
const { seedSeller } = require('./user')

async function seedData () {
  mongoose.connect(process.env.MONGO_URI, async (err, r) => {
    if (!err) {
      console.log('mongoDB connected successfully to ' + process.env.MONGO_URI)
      try {
        await seedPerms()
        await seedRole()
        await seedSuperAdmin();
        await seedSeller();
      } catch (error) {
        console.log(error)
      }
    }
  })
}
seedData()
