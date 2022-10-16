const express = require('express')
const { INTERNAL_ERR, CREATED, SUCCESS } = require('../../helpers/HTTP.CODES')
const router = express.Router()
const categoryService = require('./category.service')

router.get('/', async (req, res) => {
  try {
    const categories = await categoryService.getAll(req.query)
    return res.status(SUCCESS).send(categories)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/:id', async (req, res) => {
  try {
    const category = await categoryService.getById(req.params.id)
    return res.status(SUCCESS).send(category)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/', async (req, res) => {
  try {
    await categoryService.create(req.body)
    return res.status(CREATED).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.put('/:id', async (req, res) => {
  try {
    const updated = await categoryService.update(req.params.id, req.body)
    return res.status(CREATED).send(updated)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.delete('/:id', async (req, res) => {
  try {
    await categoryService.delete(req.params.id)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

module.exports = router
