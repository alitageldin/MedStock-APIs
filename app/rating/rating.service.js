/* eslint-disable no-useless-catch */
const { ErrorHandler } = require('../../helpers/ErrorHandler')
const { BAD_REQUEST, NOT_FOUND } = require('../../helpers/HTTP.CODES')
const Rating = require('./rating.model')
const OrderDetails = require('../orders/orderDetail.model')
const SellerProduct = require('../seller-products/sellerProducts.model')
const User = require('../users/user.model')
const Admin = require('../admin/admin.model')
const { sendEmail } = require('../emails/mailer')

const { validRatingSchema } = require('../../helpers/validation.schema')
const { default: mongoose } = require('mongoose')

exports.getAll = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{ title: { $regex: q, $options: 'i' } }]


    const pipline = [
      {
        $match: {
          $or: query
        }
      },
      { $skip: skip },
      { $limit: pageSize },
      { $sort: { [sortBy]: order } }
    ]
    const matchIndex = pipline.findIndex(aq => aq.$match)

    let refunds = await Rating.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'sellerproducts',
                localField: 'sellerProductId',
                foreignField: '_id',
                as: 'sellerproduct',
              }
            },
            {
              $unwind: {
                path: "$sellerproduct",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "products",
                localField: "sellerproduct.productId",
                foreignField: "_id",
                as: "sellerproduct.product"
              }
            },
            {
              $unwind: {
                path: "$sellerproduct.product",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
              }
            },
            ...pipline
          ],
          count: [
            { $match: { ...pipline[matchIndex].$match } },
            { $count: 'totalCount' }]
        }
      }
    ])
    refunds = JSON.parse(JSON.stringify(refunds))


    return refunds
  } catch (error) {
    throw error
  }
}


exports.getById = async (id) => {
  try {
    const refund = await Rating.findById(id)
    if (!refund) {
      throw ErrorHandler('Rating not found', NOT_FOUND)
    }
    return refund
  } catch (error) {
    throw error
  }
}
exports.create = async (data) => {
  try {
    const { error } = validRatingSchema(data)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const rating = new Rating(data)
    await rating.save();
    const orderDetails = await OrderDetails.findById(rating.orderId);
    orderDetails.userReviewed = true;
    await orderDetails.save();
    let sellerProduct = await SellerProduct.findById(orderDetails.sellerProductId);
    let seller = await User.findById(sellerProduct.userId);
    const templateHbs = 'seller-product-rating.hbs';
    let admin = await Admin.find();
    if(admin && admin.length > 0){
      admin.forEach(elem =>{
        if (seller.email) {
          sendEmail(seller.email,
            {
              orderNum: orderDetails.orderNum,
            },
            `Order and Product Rating Received`, templateHbs)
        }
      })
    }
    return rating;
  } catch (error) {
    throw error
  }
}
exports.update = async (id, req) => {
  try {
    const { error } = validRatingSchema(req.body)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const refund = await Rating.findById(id)
    if (!refund) {
      throw ErrorHandler('No refund/return found', NOT_FOUND)
    }
    refund.description = req.body.description ? req.body.description : refund.description
    refund.orderId = req.body.orderId? req.body.orderId: refund.orderId;
    refund.userId = req.body.userId? req.body.userId: refund.userId;
    refund.sellerProductId = req.body.sellerProductId? req.body.sellerProductId: refund.sellerProductId;
    refund.ratingCount = req.body.ratingCount? req.body.ratingCount: refund.ratingCount;
    await refund.save()
  } catch (error) {
    throw error
  }
}
exports.delete = async (id) => {
  try {
    if (!id) {
      throw ErrorHandler('id is required', BAD_REQUEST)
    }
    const result = await Rating.findByIdAndDelete(id)
    if (!result) {
      throw ErrorHandler('Rating not found', NOT_FOUND)
    }
    return result
  } catch (error) {
    throw error
  }
}
