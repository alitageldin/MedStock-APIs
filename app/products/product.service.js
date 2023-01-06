/* eslint-disable no-useless-catch */
const { ErrorHandler } = require('../../helpers/ErrorHandler')
const { BAD_REQUEST, NOT_FOUND } = require('../../helpers/HTTP.CODES')
const Product = require('./product.model')
const { validProductSchema } = require('../../helpers/validation.schema')
const ProductImage = require('./productImages.model')
const { default: mongoose } = require('mongoose')
const excelJS = require("exceljs");

exports.getAll = async (queryParams) => {
  try {


    // await Product.update({},{$set : {'isDeleted':false}}, {upsert:false, multi: true});
    // return;
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
    return products
  } catch (error) {
    throw error
  }
}

exports.searchProduct1 = async (body) => {
  try {
    const query = [{ name: { $regex: body.productName, $options: 'i' } }]
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
    return products
  } catch (error) {
    throw error
  }
}


exports.searchProduct = async (body, queryParams) => {
  try {
    console.log(body);
    const sortBy = body.sortBy;
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
    const order = body.orderBy && body.orderBy === 'desc' ? -1 : 1
    const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
    let query = "";
    if(body.productName){
      query = [{ name: { $regex: body.productName, $options: 'i'}}]
    }if(body.sku && body.productName){
      query = [{ name: { $regex: body.productName, $options: 'i'},  sku: { $regex: body.sku, $options: 'i'}}]
    }if(body.sku){
      query = [{sku: { $regex: body.sku, $options: 'i'}}]
    }
    
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
    if (body.categoryId) {
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          categoryId: mongoose.Types.ObjectId(body.categoryId) 
        }
      }
    }
    if(body.price){
      pipline[matchIndex] = {
        $match: {
          ...pipline[matchIndex].$match,
          price: { $lte: body.price} 
        }
      }
    }
    
    if(body.categories && body.categories.length > 0){
      let categoryIds = [];
      for(let index=0; index < body.categories.length; index++){
        categoryIds.push(mongoose.Types.ObjectId(body.categories[index]._id));
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
            ...pipline
          ],
          count: [
            { $match: { ...pipline[matchIndex].$match } },
            { $count: 'totalCount' }]
        }
      }
    ])
    products = JSON.parse(JSON.stringify(products))
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
    data.imageUrl = files?.productImages && files.productImages.length ? files.productImages.map(item => { return `${item.path}`.replace('uploads','') })[0] : undefined
    const { error } = validProductSchema(data)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const product = new Product(data)
    await product.save()
    return product;
  } catch (error) {
    throw error
  }
}
exports.update = async (id, req, files) => {
  try {
    req.body.imageUrl = files?.productImages && files.productImages.length ? files.productImages.map(item => { return `${item.path}`.replace('uploads','') })[0] : undefined
    const { error } = validProductSchema(req.body)
    if (error) {
      throw ErrorHandler(error.message, BAD_REQUEST)
    }
    const product = await Product.findById(id)
    if (!product) {
      throw ErrorHandler('No product found', NOT_FOUND)
    }
    product.name = req.body.name ? req.body.name : product.name;
    product.price = req.body.price ? req.body.price :product.price
    product.categoryId = req.body.categoryId ? req.body.categoryId : product.categoryId
    product.sku = req.body.sku ? req.body.sku : product.sku
    product.description = req.body.description ? req.body.description : product.description
    product.imageUrl = req.body.imageUrl? req.body.imageUrl: product.imageUrl;
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
    let result = await Product.findById(id)
    result.isDeleted = true;
    await result.save()
    if (!result) {
      throw ErrorHandler('Product not found', NOT_FOUND)
    }
    return result
  } catch (error) {
    throw error
  }
}


exports.exportProducts = async (queryParams, res) => {
  const workbook = new excelJS.Workbook();  // Create a new workbook
  const worksheet = workbook.addWorksheet("Products"); // New Worksheet
  const path = "./uploads/files";  // Path to download excel
  // Column for data in excel. key must match data key
  worksheet.columns = [
    { header: "Id", key: "_id", width: 10 }, 
    { header: "Name", key: "name", width: 30 },
    { header: "SKU", key: "sku", width: 30 },
    { header: "Price", key: "price", width: 30 },
    { header: "Category", key: "category", width: 30 },
    { header: "Category Id", key: "categoryId", width: 30 },
    { header: "Image Url", key: "imageUrl", width: 50 },
    { header: "Description", key: "description", width: 100 }
  ];

  const { sortBy } = queryParams
    const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
    const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 20000
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
let counter = 1;
products[0]['results'].forEach((product) => {
  var rowValues = [];
  rowValues[1] = product._id;
  rowValues[2] = product.name;
  rowValues[3] = product.sku;
  rowValues[4] = product.price;
  rowValues[5] = product.category.title;
  rowValues[6] = product.categoryId;
  rowValues[7] = product.imageUrl;
  rowValues[8] = product.description;
  const insertedRow = worksheet.insertRow(counter+1, rowValues);
  //worksheet.addRow(user); // Add data in worksheet
  counter++;
});
// Making first line in excel bold
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true };
});
  try {
    const data = await workbook.xlsx.writeFile(`${path}/products.xlsx`);
    console.log(data);
    let response = {
      path: `files/products.xlsx`,
      total: products[0]['count']
    };
    return response;

    // .then(() => {
    //   console.log(`${path}/users.xlsx`);
    //   let response = {
    //       path: `${path}/users.xlsx`,
    //     };
    //   return response;
    // });
  } catch (err) {
      return {
          message: err,
        }
    }
};