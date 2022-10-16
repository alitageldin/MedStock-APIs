/* eslint-disable no-useless-catch */
const { ErrorHandler } = require('../../helpers/ErrorHandler')
const { BAD_REQUEST, NOT_FOUND } = require('../../helpers/HTTP.CODES')
const Product = require('./product.model')
const { validProductSchema } = require('../../helpers/validation.schema')
const ProductImage = require('./productImages.model')
const { default: mongoose } = require('mongoose')

exports.getAll = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{ name: { $regex: q, $options: 'i' } }]


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

    let products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'productimages',
                localField: '_id',
                foreignField: 'productId',
                as: 'productImages'
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
    products = JSON.parse(JSON.stringify(products))

    // let products = await Product.find(query, {}, { skip: skip, limit: pageSize }).populate('categoryId').sort({ [sortBy]: order || 1 })
    // try{
    //   await products.forEach(elem => {
    //     console.log(elem._id.toString());
    //     let productImages = ProductImage.find({'productId': elem._id.toString()});
    //     elem['productImages'] = productImages;
    //     console.log(productImages);
    //   })
    // }
    // catch (error) {
    //   throw error
    // }
   
    return products
  } catch (error) {
    throw error
  }
}

exports.getSellerProducts = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const id = queryParams.id ? queryParams.id : ''
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{ name: { $regex: q, $options: 'i' } }]


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
    if (id) {
      console.log(id);
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          userId: mongoose.Types.ObjectId(id) 
        }
      }
    }
    let products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'productimages',
                localField: '_id',
                foreignField: 'productId',
                as: 'productImages'
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
    products = JSON.parse(JSON.stringify(products))

    // let products = await Product.find(query, {}, { skip: skip, limit: pageSize }).populate('categoryId').sort({ [sortBy]: order || 1 })
    // try{
    //   await products.forEach(elem => {
    //     console.log(elem._id.toString());
    //     let productImages = ProductImage.find({'productId': elem._id.toString()});
    //     elem['productImages'] = productImages;
    //     console.log(productImages);
    //   })
    // }
    // catch (error) {
    //   throw error
    // }
   
    return products
  } catch (error) {
    throw error
  }
}
exports.getById = async (id) => {
  try {
    const product = await Product.findById(id)
    if (!product) {
      throw ErrorHandler('Product not found', NOT_FOUND)
    }
    return product
  } catch (error) {
    throw error
  }
}
exports.create = async (data, files) => {
  try {
    const productImages = files?.productImages && files.productImages.length ? files.productImages.map(item => { return `${process.env.SERVER_URL}${item.path}` }) : undefined
    const { error } = validProductSchema(data)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const product = new Product(data)
    await product.save()

    await productImages.forEach(elem => {
      let productImage = new ProductImage();
      productImage.path = elem;
      productImage.productId = product._id;
      productImage.save();
    })
    return product;
  } catch (error) {
    throw error
  }
}
exports.update = async (id, data) => {
  try {
    const { error } = validProductSchema(data)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const product = await Product.findById(id)
    if (!product) {
      throw ErrorHandler('No product found', NOT_FOUND)
    }
    product.title = data.title
    product.description = data.description
    await product.save()
  } catch (error) {
    throw error
  }
}
exports.delete = async (id) => {
  try {
    if (!id) {
      throw ErrorHandler('id is required', BAD_REQUEST)
    }
    const result = await Product.findByIdAndDelete(id)
    if (!result) {
      throw ErrorHandler('Product not found', NOT_FOUND)
    }
    return result
  } catch (error) {
    throw error
  }
}
