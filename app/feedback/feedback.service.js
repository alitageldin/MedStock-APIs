/* eslint-disable no-useless-catch */
const { ErrorHandler } = require('../../helpers/ErrorHandler')
const { BAD_REQUEST, NOT_FOUND } = require('../../helpers/HTTP.CODES')
const Feedback = require('./feedback.model')
const { validFeedbackSchema } = require('../../helpers/validation.schema')
const { default: mongoose } = require('mongoose')

exports.getAllBF = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{ subject: { $regex: q, $options: 'i' } }]


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
    if (queryParams.isBuyer) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          isBuyer: true
        }
      }
    }
    let Feedbacks = await Feedback.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "buyer"
              }
            },
            {
              $unwind: {
                path: "$buyer",
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
    Feedbacks = JSON.parse(JSON.stringify(Feedbacks))


    return Feedbacks
  } catch (error) {
    throw error
  }
}



exports.getAllSF = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{ subject: { $regex: q, $options: 'i' } }]


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
    if (queryParams.isSeller) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          isSeller: true
        }
      }
    }
    let Feedbacks = await Feedback.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "seller"
              }
            },
            {
              $unwind: {
                path: "$seller",
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
    Feedbacks = JSON.parse(JSON.stringify(Feedbacks))


    return Feedbacks
  } catch (error) {
    throw error
  }
}

exports.create = async (data, files) => {
  try {
    data.imageUrl = files?.feedbackImages && files.feedbackImages.length ? files.feedbackImages.map(item => { return `${item.path}`.replace('uploads','') })[0] : undefined
    const { error } = validFeedbackSchema(data)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const promotion = new Feedback(data)
    await promotion.save()
  
   
    return promotion;
  } catch (error) {
    throw error
  }
}