const mongoose = require('mongoose')
const { seedSuperAdmin } = require('./admin')
const { seedRole } = require('./role')
const { seedSeller } = require('./user')
const { cateogry } = require('./category')

async function seedData () {
  mongoose.connect(process.env.MONGO_URI, async (err, r) => {
    if (!err) {
      console.log('mongoDB connected successfully to ' + process.env.MONGO_URI)
      try {
        await seedRole()
        await seedSuperAdmin();
        await cateogry();
        await seedSeller();
      } catch (error) {
      }
    }
  })
}
seedData()
