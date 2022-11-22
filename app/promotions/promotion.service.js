/* eslint-disable no-useless-catch */
const { ErrorHandler } = require('../../helpers/ErrorHandler')
const { BAD_REQUEST, NOT_FOUND } = require('../../helpers/HTTP.CODES')
const Promotion = require('./promotion.model')
const { validPromotionSchema } = require('../../helpers/validation.schema')
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

    let promotions = await Promotion.aggregate([
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
    promotions = JSON.parse(JSON.stringify(promotions))


    return promotions
  } catch (error) {
    throw error
  }
}


exports.getById = async (id) => {
  try {
    const promotion = await Promotion.findById(id)
    if (!promotion) {
      throw ErrorHandler('Promotion not found', NOT_FOUND)
    }
    return promotion
  } catch (error) {
    throw error
  }
}
exports.create = async (data, files) => {
  try {
    data.imageUrl = files?.promotionImages && files.promotionImages.length ? files.promotionImages.map(item => { return `${process.env.BK_SERVER_URL}${item.path}`.replace('/uploads','') })[0] : undefined
    const { error } = validPromotionSchema(data)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const promotion = new Promotion(data)
    await promotion.save()
  
   
    return promotion;
  } catch (error) {
    throw error
  }
}
exports.update = async (id, req, files) => {
  try {
    req.body.imageUrl = files?.promotionImages && files.promotionImages.length ? files.promotionImages.map(item => { return `${process.env.BK_SERVER_URL}${item.path}`.replace('/uploads','') })[0] : undefined
    console.log(req.body);
    const { error } = validPromotionSchema(req.body)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const promotion = await Promotion.findById(id)
    if (!promotion) {
      throw ErrorHandler('No promotion found', NOT_FOUND)
    }
    promotion.title = req.body.title ? req.body.title : promotion.title;
    promotion.description = req.body.description ? req.body.description : promotion.description
    promotion.imageUrl = req.body.imageUrl? req.body.imageUrl: promotion.imageUrl;
    await promotion.save()
  } catch (error) {
    throw error
  }
}
exports.delete = async (id) => {
  try {
    if (!id) {
      throw ErrorHandler('id is required', BAD_REQUEST)
    }
    const result = await Promotion.findByIdAndDelete(id)
    if (!result) {
      throw ErrorHandler('Promotion not found', NOT_FOUND)
    }
    return result
  } catch (error) {
    throw error
  }
}
