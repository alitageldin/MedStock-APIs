const express = require('express')
const router = express.Router()
const roleController = require('./roles/role.controller')
const adminAuthController = require('./admin/admin.controller')
const userController = require('./users/user.controller')
const productController = require('./products/product.controller')
const categoryController = require('./categories/category.controller')
const sellerController = require('./seller-products/sellerProducts.controller')
const  orderController = require('./orders/order.controller')
const promotionController = require('./promotions/promotion.controller')
const feedbackController = require('./feedback/feedback.controller')
const RefundController = require('./refund/refund.controller')
const RatingController = require('./rating/rating.controller')

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
router.use('/product',isUser || isAdmin, productController)
router.use('/sellerProduct',isUser || isAdmin, sellerController)
router.use('/category',isUser || isAdmin, categoryController)
router.use('/order',isUser || isAdmin, orderController)
router.use('/promotion',isUser || isAdmin, promotionController)
router.use('/feedback',isUser || isAdmin, feedbackController)
router.use('/rating',isUser || isAdmin, RatingController)
router.use('/refund',isUser || isAdmin, RefundController)

router.post('/upload-file', isUser, upload.single('file'), (req, res) => {
  try {
    res.send({ path: req.file.path })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

module.exports = router
