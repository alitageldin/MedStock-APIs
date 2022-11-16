const express = require('express')
const multer = require('multer')
const { INTERNAL_ERR, CREATED, SUCCESS } = require('../../helpers/HTTP.CODES')
const router = express.Router()
const orderService = require('./order.service')



router.post('/create', async (req, res) => {
    try {
      await orderService.create(req.body)
      return res.status(CREATED).send({})
    } catch (error) {
      return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
    }
  })


  router.get('/get-user-all-order', async (req, res) => {
    try {
      const orders =await orderService.getAllUserOrder(req.query)
      return res.status(SUCCESS).send(orders)
    } catch (error) {
      return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
    }
  })

  router.get('/get-seller-all-order', async (req, res) => {
    try {
      const orders =await orderService.getAllSellerOrder(req.query)
      return res.status(SUCCESS).send(orders)
    } catch (error) {
      return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
    }
  })


  router.get('/get-all-orders', async (req, res) => {
    try {
      const orders =await orderService.getAllOrders(req.query)
      return res.status(SUCCESS).send(orders)
    } catch (error) {
      return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
    }
  })









module.exports = router
