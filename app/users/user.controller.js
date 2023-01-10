const express = require('express')
const { INTERNAL_ERR, SUCCESS } = require('../../helpers/HTTP.CODES')
const {
  userSignUp,
  sellerSignUp,
  verifyEmail,
  deleteUser,
  reSendVerificationEmail,
  updateUser,
  getAll,
  getById,
  forgetPassword,
  userLogin,
  deleteFile,
  isUser,
  changePassword,
  genrateOTP,
  verifyOTP,
  adminUpdatesUser,
  getMyProfile,
  getTopClients,
  becomeASeller,
  becomeABuyer,
  exportApprovedSeller,
  exportRejectedSeller,
  exportPendingApprovalSeller,
  exportApprovedBuyer,
  exportPendingVerificationBuyer,
  uploadLegalDocument
} = require('./user.service')
const router = express.Router()
const multer = require('multer')
const { isAdmin } = require('../admin/admin.service')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/user-profile')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.' + file.originalname) // mime type gives ext of file
  }
})

const storageLegalDocument = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/document/seller-legal-document')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.' + file.originalname) // mime type gives ext of file
  }
})
const uploadFile = multer({ dest: 'uploads/images/user-profile/', storage: storage })
const uploadLegalDoc = multer({ dest: 'uploads/document/seller-legal-document/', storage: storageLegalDocument })

/*
 *
 *   * USER ROUTES *
 *
 */

router.post('/sign-up', uploadFile.fields([
  { name: 'profileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const accessToken = await userSignUp(req.body, req.files)
    return res.status(SUCCESS).send(accessToken)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})


router.post('/login', async (req, res) => {
  try {
    const accessToken = await userLogin(req.body)
    return res.status(SUCCESS).send(accessToken)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/generate-otp', isUser, async (req, res) => {
  try {
    await genrateOTP(req.user, req.body.phone)
    return res.status(SUCCESS).send({ success: true })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/verify-otp', isUser, async (req, res) => {
  try {
    await verifyOTP(req.user, req.body.otp)
    return res.status(SUCCESS).send({ success: true })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/verify-email/:id', async (req, res) => {
  try {
    await verifyEmail(req.params.id)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/forget-password', async (req, res) => {
  try {
    await forgetPassword(req.body)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/reset-password', async (req, res) => {
  try {
    const accessToken = await changePassword(req.body)
    return res.status(SUCCESS).send({ accessToken })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/resend-verify-email', async (req, res) => {
  try {
    await reSendVerificationEmail(req.body.email)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.put('/me', isUser, uploadFile.fields([
  { name: 'profileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const updatedUser = await updateUser(req, req.body.id)
    return res.status(SUCCESS).send(updatedUser)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/me/:id', isUser, async (req, res) => {
  try {
    const userProfile = await getMyProfile(req.params.id)
    return res.status(SUCCESS).send({ ...userProfile })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.delete('/me/attachment', isUser, async (req, res) => {
  try {
    await deleteFile(req.user.id, req.body)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/', isAdmin, async (req, res) => {
  try {
    const data = await getAll(req.query)
    return res.status(SUCCESS).send({ ...data })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/export-approved-seller', async (req, res) => {
  try {
    const data = await exportApprovedSeller(req,res)
    return res.status(SUCCESS).send(data)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.get('/export-rejected-seller', async (req, res) => {
  try {
    const data = await exportRejectedSeller(req,res)
    return res.status(SUCCESS).send(data)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.get('/export-pending-approval-seller', async (req, res) => {
  try {
    const data = await exportPendingApprovalSeller(req,res)
    return res.status(SUCCESS).send(data)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})


router.get('/export-approved-buyer', async (req, res) => {
  try {
    const data = await exportApprovedBuyer(req,res)
    return res.status(SUCCESS).send(data)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.post('/upload-legal-document',uploadLegalDoc.fields([
  { name: 'legalDocuments', maxCount: 2 }
]), async (req, res) => {
  try {
    console.log(req);
    const data = await uploadLegalDocument(req.body, req.files)
    return res.status(SUCCESS).send(data)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/export-pending-verification-buyer', async (req, res) => {
  try {
    const data = await exportPendingVerificationBuyer(req,res)
    return res.status(SUCCESS).send(data)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

// router.get('/export-pending-verification-buyer', async (req, res) => {
//   try {
//     const data = await exportPendingVerificationBuyer(req,res)
//     return res.status(SUCCESS).send(data)
//   } catch (error) {
//     return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
//   }
// })

router.get('/:id', isAdmin, async (req, res) => {
  try {
    const data = await getById(req.params.id)
    return res.status(SUCCESS).send({ ...data })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})



router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await deleteUser(req.params.id)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const updatedUser = await adminUpdatesUser(req, req.params.id)
    return res.status(SUCCESS).send({ updatedUser })
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.put('/becomeASeller/:id', isUser, async (req, res) => {
  try {
    const updatedUser = await becomeASeller(req.params.id)
    return res.status(SUCCESS).send(updatedUser)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.put('/becomeABuyer/:id', isUser, async (req, res) => {
  try {
    const updatedUser = await becomeABuyer(req.params.id)
    return res.status(SUCCESS).send(updatedUser)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})

router.put('/attachment/:id', isAdmin, async (req, res) => {
  try {
    await deleteFile(req.params.id, req.body)
    return res.status(SUCCESS).send({})
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})
router.get('/clients/top', isAdmin, async (req, res) => {
  try {
    const data = await getTopClients(req.query)
    return res.status(SUCCESS).send(data)
  } catch (error) {
    return res.status(error.status ? error.status : INTERNAL_ERR).send({ message: error.message })
  }
})




module.exports = router
