const express = require('express')
const { INTERNAL_ERR, CREATED, SUCCESS } = require('../../helpers/HTTP.CODES')
const { checkAdminPermission } = require('../admin/admin.service')
const router = express.Router()
const roleService = require('./role.service')

router.get('/', async (req, res) => {
  try {
    const roles = await roleService.getAll(req.query)
    return res.status(SUCCESS).send(roles)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/:id', async (req, res) => {
  try {
    const role = await roleService.getById(req.params.id)
    return res.status(SUCCESS).send(role)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/', async (req, res) => {
  try {
    await roleService.create(req.body)
    return res.status(CREATED).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.put('/:id', async (req, res) => {
  try {
    const updated = await roleService.update(req.params.id, req.body)
    return res.status(CREATED).send(updated)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.delete('/:id', async (req, res) => {
  try {
    await roleService.delete(req.params.id)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

module.exports = router
