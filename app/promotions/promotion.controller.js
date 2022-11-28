const express = require('express')
const multer = require('multer')
const { INTERNAL_ERR, CREATED, SUCCESS } = require('../../helpers/HTTP.CODES')
const router = express.Router()
const promotionService = require('./promotion.service')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/promotion-images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.' + file.originalname) // mime type gives ext of file
  }
})

const uploadFile = multer({ dest: 'uploads/images/promotion-images/', storage: storage })


router.get('/', async (req, res) => {
  try {
    const promotions = await promotionService.getAll(req.query)
    return res.status(SUCCESS).send(promotions)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await promotionService.getById(req.params.id)
    return res.status(SUCCESS).send(product)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/',uploadFile.fields([
  { name: 'promotionImages', maxCount: 10 }
]), async (req, res) => {
  try {
    await promotionService.create(req.body, req.files)
    return res.status(CREATED).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.put('/:id', uploadFile.fields([
  { name: 'promotionImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const updated = await promotionService.update(req.params.id, req, req.files)
    return res.status(CREATED).send(updated)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.delete('/:id', async (req, res) => {
  try {
    await promotionService.delete(req.params.id)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

module.exports = router
