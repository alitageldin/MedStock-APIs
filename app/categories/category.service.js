/* eslint-disable no-useless-catch */
const { ErrorHandler } = require('../../helpers/ErrorHandler')
const { BAD_REQUEST, NOT_FOUND } = require('../../helpers/HTTP.CODES')
const Category = require('./category.model')
const { validCategorySchema } = require('../../helpers/validation.schema')

exports.getAll = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = {
      $or: [{ title: { $regex: q, $options: 'i' } }]
    }
    const categories = await Category.find(query, {}, { skip: skip, limit: pageSize }).sort({ 'createdAt': order || -1 })
    return categories
  } catch (error) {
    throw error
  }
}
exports.getById = async (id) => {
  try {
    const category = await Category.findById(id)
    if (!category) {
      throw ErrorHandler('Category not found', NOT_FOUND)
    }
    return category
  } catch (error) {
    throw error
  }
}
exports.create = async (data) => {
  try {
    const { error } = validCategorySchema(data)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const category = new Category(data)
    await category.save()
  } catch (error) {
    throw error
  }
}
exports.update = async (id, data) => {
  try {
    const { error } = validCategorySchema(data)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const category = await Category.findById(id)
    if (!category) {
      throw ErrorHandler('no category found', NOT_FOUND)
    }
    category.title = data.title
    category.description = data.description
    await category.save()
  } catch (error) {
    throw error
  }
}
exports.delete = async (id) => {
  try {
    if (!id) {
      throw ErrorHandler('id is required', BAD_REQUEST)
    }
    const result = await Category.findByIdAndDelete(id)
    if (!result) {
      throw ErrorHandler('Category not found', NOT_FOUND)
    }
    return result
  } catch (error) {
    throw error
  }
}
