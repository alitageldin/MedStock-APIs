/* eslint-disable no-useless-catch */
const { ErrorHandler } = require('../../helpers/ErrorHandler')
const { BAD_REQUEST, NOT_FOUND } = require('../../helpers/HTTP.CODES')
const Rating = require('./rating.model')
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
    const refund = new Rating(data)
    await refund.save()
  
   
    return refund;
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
