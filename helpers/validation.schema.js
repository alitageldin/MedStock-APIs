const Joi = require('joi')
const { CLIENT, FREELANCER } = require('./constants')

exports.validRoleSchema = (data) => {
  return Joi.object({
    title: Joi.string().required().min(2),
    description: Joi.string().required().min(2)
  }).validate(data)
}
exports.validCategorySchema = (data) => {
  return Joi.object({
    title: Joi.string().required().min(2),
    description: Joi.string()
  }).validate(data)
}
exports.validProductSchema = (data) =>{
  return Joi.object({
    name: Joi.string().required(),
    price: Joi.string(),
    description : Joi.string(),
    sku : Joi.string(),
    imageUrl : Joi.string(),
    categoryId: Joi.string(),
  }).validate(data)
}

exports.validPromotionSchema = (data) =>{
  return Joi.object({
    title: Joi.string(),
    description : Joi.string(),
    imageUrl : Joi.string(),
  }).validate(data)
}

exports.validFeedbackSchema = (data) =>{
  return Joi.object({
    subject: Joi.string(),
    message : Joi.string(),
    imageUrl : Joi.string(),
    userId: Joi.string(),
    isSeller: Joi.boolean(),
    isBuyer: Joi.boolean()
  }).validate(data)
}
exports.validSellerProductSchema = (data) =>{
  return Joi.object({
    price: Joi.string(),
    discount: Joi.number(),
    quantity: Joi.number(),
    expiryDate : Joi.date(),
    notes : Joi.string(),
    categoryId: Joi.string(),
    userId: Joi.string(),
    productId: Joi.string(),
  }).validate(data)
}
exports.validOrderSchema = (data) =>{
  return Joi.object({
    totalAmmount: Joi.number(),
    discount: Joi.number(),
    notes : Joi.string(),
    userId: Joi.string(),
  }).validate(data)
}
exports.validOrderDetailSchema = (data) =>{
  return Joi.object({
    amount: Joi.string(),
    discount: Joi.number(),
    quantity: Joi.number(),
    notes : Joi.string(),
    orderId: Joi.string(),
    userId: Joi.string(),
    sellerProductId: Joi.string(),
    sellerId: Joi.string(),
  }).validate(data)
}


exports.validPermSchema = (data) => {
  return Joi.object({
    name: Joi.string().required().min(2),
    value: Joi.string().required().min(2)
  }).validate(data)
}
exports.validUserSchemaPost = (user) => {
  return Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    username: Joi.string(),
    pharmacyName: Joi.string(),
    region: Joi.string(),
    businessId: Joi.string(),
    dob: Joi.date(),
    email: Joi.string().required(),
    password: Joi.string().required().min(6),
    authType: Joi.string(),
    phone: Joi.string(),
    country: Joi.string(),
    address: Joi.string(),
    heardFrom: Joi.string(),
    isEmailVerified: Joi.boolean(),
    profileImage: Joi.string(),
    isProfileVerified: Joi.boolean(),
    signUpCompleted: Joi.boolean(),
    isBanned: Joi.boolean(),
    isSeller: Joi.boolean(),
    isBuyer: Joi.boolean(),
    selectedProfile: Joi.string(),
    city: Joi.string()
  }).validate(user)
}
exports.validUserSchemaPut = (user) => {
  return Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    username: Joi.string(),
    pharmacyName: Joi.string(),
    region: Joi.string(),
    businessId: Joi.string(),
    dob: Joi.date(),
    email: Joi.string().required(),
    password: Joi.string().required().min(6),
    authType: Joi.string(),
    phone: Joi.string(),
    country: Joi.string(),
    address: Joi.string(),
    heardFrom: Joi.string(),
    isEmailVerified: Joi.boolean(),
    profileImage: Joi.string(),
    isProfileVerified: Joi.boolean(),
    signUpCompleted: Joi.boolean(),
    isBanned: Joi.boolean(),
    isSeller: Joi.boolean(),
    isBuyer: Joi.boolean(),
    selectedProfile: Joi.string(),
    city: Joi.string(),
  }).validate(user)
}
exports.validAdminSchema = (data) => {
  return Joi.object({
    fullName: Joi.string().required().min(2),
    email: Joi.string().required().min(2),
    password: Joi.string().required().min(2),
    role: Joi.string().required().min(2)
  }).validate(data)
}
exports.validAdminPutSchema = (data) => {
  return Joi.object({
    fullName: Joi.string(),
    email: Joi.string(),
    password: Joi.string().optional().allow(''),
    role: Joi.string(),
    isBanned: Joi.boolean()
  }).validate(data)
}
exports.validPaymentSchema = (data) => {
  return Joi.object({
    freelancer: Joi.object(),
    job: Joi.object(),
    createdBy: Joi.object(),
    amount: Joi.number(),
    status: Joi.string(),
    paymentDate: Joi.date()
  }).validate(data)
}

exports.validJobSchema = (data) => {
  return Joi.object({
    title: Joi.string().required().min(2),
    assignedTo: Joi.object(),
    description: Joi.string().required().min(2),
    attachments: Joi.array(),
    endDate: Joi.date().required(),
    price: Joi.number().required(),
    client: Joi.object().required(),
    category: Joi.object().required(),
    clientRoomId: Joi.string(),
    status: Joi.string().optional(),
    freelancerRoomId: Joi.string()
  }).validate(data)
}
exports.validReviewSchema = (data) => {
  return Joi.object({
    comment: Joi.string().required(),
    jobTitle: Joi.string().required().min(3),
    rating: Joi.number().required().min(0).max(5),
    job: Joi.string().required()
  }).validate(data)
}

exports.validInvoiceSchema = (data) => {
  return Joi.object({
    consumer: Joi.string().required(),
    invoiceDate: Joi.date().required(),
    dueDate: Joi.date().required(),
    amountPayable: Joi.number().required().min(0),
    job: Joi.string().required()
  }).validate(data)
}
