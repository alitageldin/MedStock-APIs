const express = require('express')
const multer = require('multer')
const { INTERNAL_ERR, CREATED, SUCCESS } = require('../../helpers/HTTP.CODES')
const router = express.Router()
const ratingService = require('./rating.service')

router.get('/', async (req, res) => {
  try {
    const promotions = await ratingService.getAll(req.query)
    return res.status(SUCCESS).send(promotions)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await ratingService.getById(req.params.id)
    return res.status(SUCCESS).send(product)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/', async (req, res) => {
  try {
    await ratingService.create(req.body)
    return res.status(CREATED).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.put('/:id', async (req, res) => {
  try {
    const updated = await ratingService.update(req.params.id, req)
    return res.status(CREATED).send(updated)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.delete('/:id', async (req, res) => {
  try {
    await ratingService.delete(req.params.id)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

module.exports = router
