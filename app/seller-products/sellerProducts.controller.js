const express = require('express')
const multer = require('multer')
const { INTERNAL_ERR, CREATED, SUCCESS } = require('../../helpers/HTTP.CODES')
const router = express.Router()
const productService = require('./sellerProducts.service')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/seller-product-images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.' + file.originalname) // mime type gives ext of file
  }
})

const uploadFile = multer({ dest: 'uploads/images/seller-product-images/', storage: storage })
router.get('/get-seller-products', async (req, res) => {
  try {
    const products = await productService.getSellerProducts(req.query)
    return res.status(SUCCESS).send(products)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.get('/search-seller-products', async (req, res) => {
  try {
    const products = await productService.searchSellerProducts(req.query)
    return res.status(SUCCESS).send(products)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.get('/get-seller-specific-product', async (req, res) => {
  try {
    const products = await productService.getSpecificSellerProduct(req.query)
    return res.status(SUCCESS).send(products)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.get('/update-view-count/:id', async (req, res) => {
  try {
    const products = await productService.updateSellerProductViewdCount(req.params.id)
    return res.status(SUCCESS).send(products)
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
    console.log(req.body);
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

router.get('/get-seller-feature-products', async (req, res) => {
  try {
    const products = await productService.getSellerFeatureProduct(req.query)
    return res.status(SUCCESS).send(products)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})


router.get('/get-seller-feature-product-count/:id', async (req, res) => {
  try {
    const count = await productService.getSellerFeatureProductCount(req.params.id)
    return res.status(SUCCESS).send(count)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})


router.put('/add-feature-product/:id', async (req, res) => {
  try {
    const updated = await productService.addFeatureProduct(req.params.id, req.body)
    return res.status(SUCCESS).send(updated)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.get('/get-highly-discount-products', async (req, res) => {
  try {
    const products = await productService.getHighlyDiscountProduct(req.query)
    return res.status(SUCCESS).send(products)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.get('/get-sale-products', async (req, res) => {
  try {
    const products = await productService.getSaleProduct(req.query)
    return res.status(SUCCESS).send(products)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.post('/get-filter-seller-products', async (req, res) => {
  try {
    const products = await productService.getFilteredSellerProducts(req.query, req.body)
    return res.status(SUCCESS).send(products)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})


module.exports = router
