const express = require('express')
const multer = require('multer')
const { INTERNAL_ERR, CREATED, SUCCESS } = require('../../helpers/HTTP.CODES')
const router = express.Router()
const feedbackService = require('./feedback.service')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/feedback-images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.' + file.originalname) // mime type gives ext of file
  }
})

const uploadFile = multer({ dest: 'uploads/images/feedback-images/', storage: storage })


router.get('/buyer-feedback', async (req, res) => {
  try {
    const feedbacks = await feedbackService.getAllBF(req.query)
    return res.status(SUCCESS).send(feedbacks)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.get('/seller-feedback', async (req, res) => {
  try {
    const feedbacks = await feedbackService.getAllSF(req.query)
    return res.status(SUCCESS).send(feedbacks)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.post('/',uploadFile.fields([
  { name: 'feedbackImages', maxCount: 10 }
]), async (req, res) => {
  try {
    await feedbackService.create(req.body, req.files)
    return res.status(CREATED).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})


module.exports = router
