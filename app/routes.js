const express = require('express')
const router = express.Router()
const roleController = require('./roles/role.controller')
const adminAuthController = require('./admin/admin.controller')
const userController = require('./users/user.controller')
const { isAdmin } = require('./admin/admin.service')
const { isUser } = require('./users/user.service')

const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/user-profile')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.' + file.originalname) // mime type gives ext of file
  }
})
const upload = multer({ dest: 'uploads/images/user-profile', storage: storage })

router.use('/role', isAdmin, roleController)
router.use('/admin', adminAuthController)
router.use('/user', userController)
router.post('/upload-file', isUser, upload.single('file'), (req, res) => {
  try {
    res.send({ path: req.file.path })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

module.exports = router
