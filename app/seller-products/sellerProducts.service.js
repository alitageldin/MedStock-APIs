/* eslint-disable no-useless-catch */
const { ErrorHandler } = require('../../helpers/ErrorHandler')
const { BAD_REQUEST, NOT_FOUND } = require('../../helpers/HTTP.CODES')
const Product = require('./sellerProducts.model')
const AdminProduct = require('.././products/product.model')

const { validSellerProductSchema, validUpdateSellerProductSchema } = require('../../helpers/validation.schema')
const ProductImage = require('./sellerProductImages.model')
const { default: mongoose } = require('mongoose')

exports.getAll = async (id) => {
  try {
    const query = [{userId: id}]
    const pipline = [
      {
        $match: {
          $or: query
        }
      }
    ]
    const matchIndex = pipline.findIndex(aq => aq.$match)
    pipline[matchIndex] = {
      $match: {
        ...pipline[matchIndex].$match,
        isDeleted: false
      }
    }
    let products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'sellerproductimages',
                localField: '_id',
                foreignField: 'sellerProductId',
                as: 'productImages'
              }
            },
            {
              $lookup: {
                  from: "ratings",
                  let: { id: { $toObjectId: "$_id" } },
                  pipeline: [{ $match: { $expr: { $eq: ["$sellerProductId", "$$id"] } } },
                  {
                      $lookup: {
                          from: "users",
                          let: { userId: { $toObjectId: "$userId" } },
                          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
                          as: "buyer"
                      },
                  }, {
                      $unwind: {
                          path: "$buyer",
                          preserveNullAndEmptyArrays: true
                      }
                  }
                  ],
                  as: "ratings"
              },
          },
            {
              $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $unwind: {
                path: "$category",
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
    return products
  } catch (error) {
    return error
  }
}

exports.getSellerProducts = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const id = queryParams.id ? queryParams.id : ''
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 1000
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{}]

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
    pipline[matchIndex] = {
      $match: {
        ...pipline[matchIndex].$match,
        isDeleted: false
      }
    }
    if (id) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          userId: mongoose.Types.ObjectId(id) 
        }
      }
    }
    if (queryParams.sellerProductId) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          _id: mongoose.Types.ObjectId(queryParams.sellerProductId) 
        }
      }
    }
    let products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'sellerproductimages',
                localField: '_id',
                foreignField: 'sellerProductId',
                as: 'productImages'
              }
            },
            {
              $lookup: {
                  from: "ratings",
                  let: { id: { $toObjectId: "$_id" } },
                  pipeline: [{ $match: { $expr: { $eq: ["$sellerProductId", "$$id"] } } },
                  {
                      $lookup: {
                          from: "users",
                          let: { userId: { $toObjectId: "$userId" } },
                          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
                          as: "buyer"
                      },
                  }, {
                      $unwind: {
                          path: "$buyer",
                          preserveNullAndEmptyArrays: true
                      }
                  }
                  ],
                  as: "ratings"
              },
          },
            {
              $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $unwind: {
                path: "$category",
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
    products = JSON.parse(JSON.stringify(products))
    return products;
  } catch (error) {
    throw error
  }
}


exports.searchSellerProducts = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const id = queryParams.id ? queryParams.id : ''
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 1000
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{}]

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
    pipline[matchIndex] = {
      $match: {
        ...pipline[matchIndex].$match,
        isDeleted: false
      }
    }
    if (queryParams.categoryId) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          categoryId: mongoose.Types.ObjectId(queryParams.categoryId) 
        }
      }
    }

    if (id) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          userId: mongoose.Types.ObjectId(id) 
        }
      }
    }
    if(queryParams.productName){
      let productIds = await AdminProduct.distinct("_id", { name: { $regex: queryParams.productName, $options: 'i' } })
      if(productIds && productIds.length > 0){
        pipline[matchIndex] = {
          // $match: {
          //   ...pipline[matchIndex].$match,
          //   _id: mongoose.Types.ObjectId(queryParams.sellerProductId) 
          // }

          $match: { 
            ...pipline[matchIndex].$match, 
            productId: { $in: productIds}
          }
        }

      }
    }

    if (queryParams.sellerProductId) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          _id: mongoose.Types.ObjectId(queryParams.sellerProductId) 
        }
      }
    }
    let products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'sellerproductimages',
                localField: '_id',
                foreignField: 'sellerProductId',
                as: 'productImages'
              }
            },
            {
              $lookup: {
                  from: "ratings",
                  let: { id: { $toObjectId: "$_id" } },
                  pipeline: [{ $match: { $expr: { $eq: ["$sellerProductId", "$$id"] } } },
                  {
                      $lookup: {
                          from: "users",
                          let: { userId: { $toObjectId: "$userId" } },
                          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
                          as: "buyer"
                      },
                  }, {
                      $unwind: {
                          path: "$buyer",
                          preserveNullAndEmptyArrays: true
                      }
                  }
                  ],
                  as: "ratings"
              },
          },
            {
              $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $unwind: {
                path: "$category",
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
    products = JSON.parse(JSON.stringify(products))
    return products;
  } catch (error) {
    throw error
  }
}

exports.getSpecificSellerProduct = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const id = queryParams.id ? queryParams.id : ''
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 1000
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{}]

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
    if (queryParams.id) {
      // let sellerProduct = await sellerProduct.findById(queryParams.id);
      // if(sellerProduct){
      //   if(!sellerProduct.viewedCount){
      //     sellerProduct.viewedCount = 1;
      //   }else{
      //     sellerProduct.viewedCount = sellerProduct.viewedCount + 1;
      //   }
      //   sellerProduct.save();
      // }
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          _id: mongoose.Types.ObjectId(queryParams.id) 
        }
      }
    }
    let products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'sellerproductimages',
                localField: '_id',
                foreignField: 'sellerProductId',
                as: 'productImages'
              }
            },
            {
              $lookup: {
                  from: "ratings",
                  let: { id: { $toObjectId: "$_id" } },
                  pipeline: [{ $match: { $expr: { $eq: ["$sellerProductId", "$$id"] } } },
                  {
                      $lookup: {
                          from: "users",
                          let: { userId: { $toObjectId: "$userId" } },
                          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
                          as: "buyer"
                      },
                  }, {
                      $unwind: {
                          path: "$buyer",
                          preserveNullAndEmptyArrays: true
                      }
                  }
                  ],
                  as: "ratings"
              },
          },
            {
              $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $unwind: {
                path: "$category",
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
    products = JSON.parse(JSON.stringify(products))
    return products[0].results[0];
  } catch (error) {
    return {};
  }
}


exports.updateSellerProductViewdCount = async (id) => {
  try {
    if (id) {
      let sellerProduct = await Product.findById(id);
      if(sellerProduct){
        if(!sellerProduct.viewedCount){
          sellerProduct.viewedCount = 1;
        }else{
          sellerProduct.viewedCount = sellerProduct.viewedCount + 1;
        }
        sellerProduct.save();
      }
      return sellerProduct;
    }
  } catch (error) {
    return {};
  }
}

exports.getSellerFeatureProduct = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const id = queryParams.id ? queryParams.id : ''
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 1000
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{}]

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
    pipline[matchIndex] = {
      $match: {
        ...pipline[matchIndex].$match,
        isDeleted: false
      }
    }
    if (queryParams.categoryId) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          categoryId: mongoose.Types.ObjectId(queryParams.categoryId) 
        }
      }
    }

    pipline[matchIndex] = {
      $match: {
        ...pipline[matchIndex].$match,
        isFeatured: true
      }
    }
    if (id) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          userId: mongoose.Types.ObjectId(id) 
        }
      }
    }
    if(queryParams.productName){
      let productIds = await AdminProduct.distinct("_id", { name: { $regex: queryParams.productName, $options: 'i' } })
      if(productIds && productIds.length > 0){
        pipline[matchIndex] = {
          $match: { 
            ...pipline[matchIndex].$match, 
            productId: { $in: productIds}
          }
        }
      }
    }

    if (queryParams.sellerProductId) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          _id: mongoose.Types.ObjectId(queryParams.sellerProductId) 
        }
      }
    }
    let products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'sellerproductimages',
                localField: '_id',
                foreignField: 'sellerProductId',
                as: 'productImages'
              }
            },
           
            {
              $lookup: {
                  from: "ratings",
                  let: { id: { $toObjectId: "$_id" } },
                  pipeline: [{ $match: { $expr: { $eq: ["$sellerProductId", "$$id"] } } },
                  {
                      $lookup: {
                          from: "users",
                          let: { userId: { $toObjectId: "$userId" } },
                          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
                          as: "buyer"
                      },
                  }, {
                      $unwind: {
                          path: "$buyer",
                          preserveNullAndEmptyArrays: true
                      }
                  }
                  ],
                  as: "ratings"
              },
          },
            {
              $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $unwind: {
                path: "$category",
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
    products = JSON.parse(JSON.stringify(products))
    return products;
  } catch (error) {
    throw error
  }
}


exports.getSellerFeatureProductCount = async (id) => {
  try {
    let count = await Product.find({'userId':id,'isFeatured': true, 'isDeleted': false}).count()
    return {'totalFeatureProduct': count};
  } catch (error) {
    return 0;
  }
}



exports.getHighlyDiscountProduct = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const id = queryParams.id ? queryParams.id : ''
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 1000
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'asc' ? 1 : -1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{}]

    const pipline = [
      {
        $match: {
          $or: query
        }
      },
      { $skip: skip },
      { $limit: pageSize },
      { $sort: { 'discount': order } }
    ]
    const matchIndex = pipline.findIndex(aq => aq.$match)
    pipline[matchIndex] = {
      $match: {
        ...pipline[matchIndex].$match,
        isDeleted: false
      }
    }
    if (queryParams.categoryId) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          categoryId: mongoose.Types.ObjectId(queryParams.categoryId) 
        }
      }
    }
    if(queryParams.productName){
      let productIds = await AdminProduct.distinct("_id", { name: { $regex: queryParams.productName, $options: 'i' } })
      if(productIds && productIds.length > 0){
        pipline[matchIndex] = {
          // $match: {
          //   ...pipline[matchIndex].$match,
          //   _id: mongoose.Types.ObjectId(queryParams.sellerProductId) 
          // }

          $match: { 
            ...pipline[matchIndex].$match, 
            productId: { $in: productIds}
          }
        }

      }
    }

    if (queryParams.sellerProductId) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          _id: mongoose.Types.ObjectId(queryParams.sellerProductId) 
        }
      }
    }
    let products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'sellerproductimages',
                localField: '_id',
                foreignField: 'sellerProductId',
                as: 'productImages'
              }
            },
            {
              $lookup: {
                  from: "ratings",
                  let: { id: { $toObjectId: "$_id" } },
                  pipeline: [{ $match: { $expr: { $eq: ["$sellerProductId", "$$id"] } } },
                  {
                      $lookup: {
                          from: "users",
                          let: { userId: { $toObjectId: "$userId" } },
                          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
                          as: "buyer"
                      },
                  }, {
                      $unwind: {
                          path: "$buyer",
                          preserveNullAndEmptyArrays: true
                      }
                  }
                  ],
                  as: "ratings"
              },
          },
            {
              $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $unwind: {
                path: "$category",
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
    products = JSON.parse(JSON.stringify(products))
    return products;
  } catch (error) {
    throw error
  }
}

exports.getSaleProduct = async (queryParams) => {
  try {
    const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const id = queryParams.id ? queryParams.id : ''
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 1000
    const q = queryParams.q ? queryParams.q : ''
    const order = queryParams.order && queryParams.order === 'asc' ? 1 : -1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{}]

    const pipline = [
      {
        $match: {
          $or: query
        }
      },
      { $skip: skip },
      { $limit: pageSize },
      { $sort: { 'createdAt': order } }
    ]
    const matchIndex = pipline.findIndex(aq => aq.$match)
    pipline[matchIndex] = {
      $match: {
        ...pipline[matchIndex].$match,
        isDeleted: false
      }
    }
    if (queryParams.categoryId) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          categoryId: mongoose.Types.ObjectId(queryParams.categoryId) 
        }
      }
    }
    if(queryParams.productName){
      let productIds = await AdminProduct.distinct("_id", { name: { $regex: queryParams.productName, $options: 'i' } })
      if(productIds && productIds.length > 0){
        pipline[matchIndex] = {
          // $match: {
          //   ...pipline[matchIndex].$match,
          //   _id: mongoose.Types.ObjectId(queryParams.sellerProductId) 
          // }

          $match: { 
            ...pipline[matchIndex].$match, 
            productId: { $in: productIds}
          }
        }
      }
    }

    if (queryParams.sellerProductId) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          _id: mongoose.Types.ObjectId(queryParams.sellerProductId) 
        }
      }
    }
    let products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'sellerproductimages',
                localField: '_id',
                foreignField: 'sellerProductId',
                as: 'productImages'
              }
            },
            {
              $lookup: {
                  from: "ratings",
                  let: { id: { $toObjectId: "$_id" } },
                  pipeline: [{ $match: { $expr: { $eq: ["$sellerProductId", "$$id"] } } },
                  {
                      $lookup: {
                          from: "users",
                          let: { userId: { $toObjectId: "$userId" } },
                          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
                          as: "buyer"
                      },
                  }, {
                      $unwind: {
                          path: "$buyer",
                          preserveNullAndEmptyArrays: true
                      }
                  }
                  ],
                  as: "ratings"
              },
          },
            {
              $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $unwind: {
                path: "$category",
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
    products = JSON.parse(JSON.stringify(products))
    return products;
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
    const productImages = files?.productImages && files.productImages.length ? files.productImages.map(item => { return `${item.path}`.replace('uploads','') }) : undefined
    const { error } = validSellerProductSchema(data)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    if(!data.remainingQuantity){
      data.remainingQuantity = data.quantity;
    }
    const product = new Product(data)
    await product.save()
    if(productImages && productImages.length > 0){
      await productImages.forEach(elem => {
        let productImage = new ProductImage();
        productImage.path = elem;
        productImage.sellerProductId = product._id;
        productImage.save();
      })
    }
    return product;
  } catch (error) {
    throw error
  }
}
exports.update = async (id, data) => {
  try {
   
    const product = await Product.findById(id)
    if (!product) {
      throw ErrorHandler('No product found', NOT_FOUND)
    }
    product.quantity = data.quantity
    if(data.remainingQuantity){
      product.remainingQuantity = data.remainingQuantity;
    }
    product.discount = data.discount
    product.price = data.price
    product.expiryDate = data.expiryDate
    // product.productId = data.productId 
    // product.categoryId = data.categoryId
    product.notes = data.notes
    product.minOrderQuantity = data.minOrderQuantity
    product.maxOrderQuantity = data.maxOrderQuantity
    if(data.isFeatured){
      product.isFeatured = data.isFeatured;
    }else{
      product.isFeatured = false;
    }

    if(data.isDeleted){
      product.isDeleted = data.isDeleted;
    }
    await product.save()
  } catch (error) {
    throw error
  }
}

exports.addFeatureProduct = async (id, data) => {
  try {
    const { error } = validSellerProductSchema(data)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const product = await Product.findById(id)
    if (!product) {
      throw ErrorHandler('No product found', NOT_FOUND)
    }
    if(product.isFeatured){
      product.isFeatured = false;
    }else{
      product.isFeatured = true;
    }
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
    const result = await Product.findById(id)
    if(result){
      result.isDeleted = true;
      await result.save();
    } else{
      throw ErrorHandler('Product not found', NOT_FOUND)
    }
    return result
  } catch (error) {
    throw error
  }
}

exports.getFilteredSellerProducts = async (queryParams, body) => {
  try {
    const sortBy = body.sortBy;
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 1000
    const order = body.orderBy && body.orderBy === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    const query = [{}]

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
    pipline[matchIndex] = {
      $match: {
        ...pipline[matchIndex].$match,
        isDeleted: false
      }
    }
    if(body.price){
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          price: { $gte: body.price[0], $lte: body.price[1] } 
        }
      }
    }
    if(body.discount){
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          discount: { $gte: body.discount} 
        }
      }
    }
    if(body.expiryDate){
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          expiryDate: { $lte: new Date(body.expiryDate)} 
        }
      }
    }
    if(body.categories && body.categories.length > 0){
      let categoryIds = [];
      for(let index=0; index < body.categories.length; index++){
        categoryIds.push(mongoose.Types.ObjectId(body.categories[index]));
      }
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          categoryId: { $in: categoryIds}
        }
      }
    }

    let products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $lookup: {
                from: 'sellerproductimages',
                localField: '_id',
                foreignField: 'sellerProductId',
                as: 'productImages'
              }
            },
            {
              $lookup: {
                  from: "ratings",
                  let: { id: { $toObjectId: "$_id" } },
                  pipeline: [{ $match: { $expr: { $eq: ["$sellerProductId", "$$id"] } } },
                  {
                      $lookup: {
                          from: "users",
                          let: { userId: { $toObjectId: "$userId" } },
                          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
                          as: "buyer"
                      },
                  }, {
                      $unwind: {
                          path: "$buyer",
                          preserveNullAndEmptyArrays: true
                      }
                  }
                  ],
                  as: "ratings"
              },
          },
            {
              $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $unwind: {
                path: "$category",
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
    products = JSON.parse(JSON.stringify(products))
    return products;
  } catch (error) {
    throw error
  }
}

