const express = require('express')
const multer = require('multer')
const { INTERNAL_ERR, CREATED, SUCCESS } = require('../../helpers/HTTP.CODES')
const router = express.Router()
const productService = require('./product.service')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/product-images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.' + file.originalname) // mime type gives ext of file
  }
})

const uploadFile = multer({ dest: 'uploads/images/product-images/', storage: storage })


router.get('/', async (req, res) => {
  try {
    const products = await productService.getAll(req.query)
    return res.status(SUCCESS).send(products)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})


router.get('/get-seller-products', async (req, res) => {
  try {
    const products = await productService.getSellerProducts(req.query)
    return res.status(SUCCESS).send(products)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/:id', async (req, res) => {
  try {
    const product = await productService.getById(req.params.id)
    return res.status(SUCCESS).send(product)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/',uploadFile.fields([
  { name: 'productImages', maxCount: 10 }
]), async (req, res) => {
  try {
    await productService.create(req.body, req.files)
    return res.status(CREATED).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.put('/:id', async (req, res) => {
  try {
    const updated = await productService.update(req.params.id, req.body)
    return res.status(CREATED).send(updated)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.delete('/:id', async (req, res) => {
  try {
    await productService.delete(req.params.id)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

module.exports = router
