const express = require('express')
const { INTERNAL_ERR, SUCCESS, CREATED } = require('../../helpers/HTTP.CODES')
const adminService = require('./admin.service')
const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const accessToken = await adminService.login(email, password)
    return res.status(SUCCESS).send(accessToken)
  } catch (error) {
    return res.status(error.status || INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/', adminService.isAdmin, async (req, res) => {
  try {
    await adminService.create(req.body)
    return res.status(CREATED).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/', adminService.isAdmin, async (req, res) => {
  try {
    const data = await adminService.getAll(req.query)
    return res.status(SUCCESS).send({ ...data })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})


/**Anayltics  start*/
router.get('/get-analytics', adminService.isAdmin, async (req, res) => {
  try {
    const data = await adminService.getAnalytics(req.query)
    return res.status(SUCCESS).send(data)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
//Total Buyer Registered
// router.get('/get-total-buyer-registered', adminService.isAdmin, async (req, res) => {
//   try {
//     const data = await adminService.getTotalBuyerRegistered(req.query)
//     return res.status(SUCCESS).send({ ...data })
//   } catch (error) {
//     return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
//   }
// })
// //Total Seller Registered
// router.get('/get-total-seller-registered', adminService.isAdmin, async (req, res) => {
//   try {
//     const data = await adminService.getTotalSellerRegistered(req.query)
//     return res.status(SUCCESS).send({ ...data })
//   } catch (error) {
//     return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
//   }
// })
// //Total Approved Seller
// router.get('/get-total-approved-seller-registered', adminService.isAdmin, async (req, res) => {
//   try {
//     const data = await adminService.getTotalApprovedSellerRegistered(req.query)
//     return res.status(SUCCESS).send({ ...data })
//   } catch (error) {
//     return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
//   }
// })
// //Total Seller Products
// router.get('/get-total-seller-products', adminService.isAdmin, async (req, res) => {
//   try {
//     const data = await adminService.getTotalSellerProducts(req.query)
//     return res.status(SUCCESS).send({ ...data })
//   } catch (error) {
//     return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
//   }
// })
// //Total Featured Products
// router.get('/get-total-featured-products', adminService.isAdmin, async (req, res) => {
//   try {
//     const data = await adminService.getTotalFeaturedProducts(req.query)
//     return res.status(SUCCESS).send({ ...data })
//   } catch (error) {
//     return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
//   }
// })
// //Total Orders
// router.get('/get-total-orders', adminService.isAdmin, async (req, res) => {
//   try {
//     const data = await adminService.getTotalOrders(req.query)
//     return res.status(SUCCESS).send({ ...data })
//   } catch (error) {
//     return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
//   }
// })
// //Order Month Wise
// router.get('/get-total-orders-monthly', adminService.isAdmin, async (req, res) => {
//   try {
//     const data = await adminService.getTotalOrdersMonthly(req.query)
//     return res.status(SUCCESS).send({ ...data })
//   } catch (error) {
//     return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
//   }
// })
/**Anayltics  end*/

router.get('/:id', adminService.isAdmin, async (req, res) => {
  try {
    const data = await adminService.getById(req.params.id)
    return res.status(SUCCESS).send({ ...data })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.put('/:id', adminService.isAdmin, async (req, res) => {
  try {
    const updatedUser = await adminService.update(req.body, req.params.id)
    return res.status(SUCCESS).send({ updatedUser })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.delete('/:id', adminService.isAdmin, async (req, res) => {
  try {
    await adminService.delete(req.params.id)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.post('/forget-password', async (req, res) => {
  try {
    await adminService.forgetPassword(req.body)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/change-password', async (req, res) => {
  try {
    const accessToken = await adminService.changePassword(req.body)
    return res.status(SUCCESS).send({ accessToken })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.post('/get-all-seller', async(req, res) => {
  try {
    const sellers = await adminService.getAllSeller(req.query);
    return res.status(SUCCESS).send(sellers)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.post('/get-all-buyers', async(req, res) => {
  try {
    const sellers = await adminService.getAllBuyer(req.query);
    return res.status(SUCCESS).send(sellers)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.post('/get-all-pending-approval-seller', async(req, res) => {
  try {
    const sellers = await adminService.getAllPendingApprovalSeller(req.query);
    return res.status(SUCCESS).send(sellers)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.post('/seller-approved', async(req, res) => {
  try {
    const sellers = await adminService.sellerApproved(req.body._id);
    return res.status(SUCCESS).send(sellers)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.post('/seller-doc-approved', async(req, res) => {
  try {
    const sellers = await adminService.sellerDocApproved(req.body._id);
    return res.status(SUCCESS).send(sellers)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/seller-doc-disapproved', async(req, res) => {
  try {
    const sellers = await adminService.sellerDocDisapproved(req.body._id);
    return res.status(SUCCESS).send(sellers)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})


router.post('/seller-disapproved', async(req, res) => {
  try {
    const sellers = await adminService.sellerDisapproved(req.body._id);
    return res.status(SUCCESS).send(sellers)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.post('/buyer-approved', async(req, res) => {
  try {
    const sellers = await adminService.buyerApproved(req.body._id);
    return res.status(SUCCESS).send(sellers)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.post('/buyer-disapproved', async(req, res) => {
  try {
    const sellers = await adminService.buyerDisapproved(req.body._id);
    return res.status(SUCCESS).send(sellers)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
module.exports = router
