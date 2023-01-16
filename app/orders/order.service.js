/* eslint-disable no-useless-catch */
const { ErrorHandler } = require('../../helpers/ErrorHandler')
const { BAD_REQUEST, NOT_FOUND } = require('../../helpers/HTTP.CODES')
const Order = require('./order.model')
const { validOrderDetailSchema } = require('../../helpers/validation.schema')
const { validOrderSchema } = require('../../helpers/validation.schema')
const OrderDetails = require('./orderDetail.model')
const User = require('../users/user.model')
const { default: mongoose } = require('mongoose')
const { sendEmail } = require('../emails/mailer')
const excelJS = require("exceljs");
const SellerProductsModel = require('../seller-products/sellerProducts.model')


exports.create = async (data) => {
    try {
      const order = new Order()
      order.totalAmmount = data.totalAmmount;
      order.discount = data.discount;
      order.userId = data.userId;
      order.notes = data.notes;
      await order.save();
      let sellerIdsList = [];
      if(data && data.orderList.length > 0){
        let count = await OrderDetails.count();
        await data.orderList.forEach(elem => {
          count++;
          let orderDetails = new OrderDetails();
          orderDetails.ammount = elem.ammount;
          orderDetails.quantity = elem.quantity;
          orderDetails.discount = elem.discount;
          orderDetails.userId = elem.userId;
          orderDetails.sellerProductId = elem.sellerProductId;
          orderDetails.sellerId = elem.sellerId;
          orderDetails.notes = elem.notes;
          orderDetails.orderId = order._id;
          orderDetails.orderNum = "1000"+count;
          orderDetails.userReviewed = false;
          sellerIdsList.push(elem.sellerId);
          orderDetails.save();
          
          
        })

        data.orderList.forEach(async elem => {
          const sellerProduct = await SellerProductsModel.findById(elem.sellerProductId);
          console.log(sellerProduct);
          if(sellerProduct){
            if(!sellerProduct.remainingQuantity){
              sellerProduct.remainingQuantity = sellerProduct.quantity - elem.quantity;
            }else{
              sellerProduct.remainingQuantity = sellerProduct.remainingQuantity - elem.quantity;
            }
            await sellerProduct.save();
          }
        
        })
        const sellers = await User.find({'_id':{$in: sellerIdsList}}).lean();
        console.log(sellers);
        if(sellers && sellers.length > 0){
          sellers.forEach(elem => {
          const templateHbs = 'order-receive.hbs'
            if (elem.email && elem.email.length) {
              sendEmail(elem.email,
                {
                  email: elem.email,
                },
                `New Order Received`, templateHbs)
            }
          })
        } 
      }
      
          
        //   const templateHbs = 'order-receive.hbs'
        //   if (seller.email && seller.email.length) {
        //     sendEmail(seller.email,
        //       {
        //         email: seller.email,
        //       },
        //       `New Order Received`, templateHbs)
        //   }
        // })
      return true;
    } catch (error) {
      throw error
    }
  }


  exports.updateStatusOrder = async (data) => {
    try {
      let orderDetails = await  OrderDetails.findById(data.orderId);
      if(orderDetails){
        orderDetails.status = data.status;
        if(data.status==='CANCEL'){
          orderDetails.remainingQuantity =  orderDetails.remainingQuantity + data.remainingQuantity;
        }
        await orderDetails.save();
      }
      return orderDetails;
    } catch (error) {
      throw error
    }
  }


  exports.getAllUserOrderOld = async (id) => {
    try {
      var orders = Order.find({'userId': id})
      return orders;
    } catch (error) {
      throw error
    }
  }


  exports.getAllUserOrder = async (queryParams) => {
    try {
      const { sortBy } = queryParams
      const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
      const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
      const q = queryParams.q ? queryParams.q : ''
      const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
      const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
      const query = [{ }]
        
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
      if (queryParams.userId) {
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            userId: mongoose.Types.ObjectId(queryParams.userId) 
          }
        }
      }

      if (queryParams.orderId) {
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            _id: mongoose.Types.ObjectId(queryParams.orderId) 
          }
        }
      }
      let orders = await Order.aggregate([
        {
          $facet: {
            results: [
              {
                $lookup: {
                    from: "orderdetails",
                    let: { orderdetailid: { $toObjectId: "$_id" } },
                    pipeline: [{ $match: { $expr: { $eq: ["$orderId", "$$orderdetailid"] } } },
                    {
                        $lookup: {
                            from: "users",
                            let: { userid: { $toObjectId: "$userId" } },
                            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userid"] } } }],
                            as: "buyer"
                        },
                    }, {
                        $unwind: {
                            path: "$buyer",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { sellerId: { $toObjectId: "$sellerId" } },
                            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$sellerId"] } } }],
                            as: "seller"
                        },
                    }, {
                        $unwind: {
                            path: "$seller",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "sellerproducts",
                            let: { sellerProductId: { $toObjectId: "$sellerProductId" } },
                            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$sellerProductId"] } } },
                            {
                                $lookup: {
                                    from: "products",
                                    let: { productId: { $toObjectId: "$productId" } },
                                    pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
                                    as: "product"
                                },
                            }, {
                                $unwind: {
                                    path: "$product",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $lookup: {
                                    from: "sellerproductimages",
                                    let: { id: { $toObjectId: "$_id" } },
                                    pipeline: [{ $match: { $expr: { $eq: ["$sellerProductId", "$$id"] } } }],
                                    as: "productImages"
                                },
                            },
                            ],
                            as: "sellerProduct"
                        },
                    }, {
                        $unwind: {
                            path: "$sellerProduct",
                            preserveNullAndEmptyArrays: true
                        }
                    },],
                    as: "orderDetails"
        
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
      return orders
    } catch (error) {
      throw error
    }
  }



  exports.getUserSpecificOrder = async (queryParams) => {
    try {
      const { sortBy } = queryParams
      const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
      const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
      const q = queryParams.q ? queryParams.q : ''
      const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
      const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
      const query = [{ }]
        
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
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            _id: mongoose.Types.ObjectId(queryParams.id) 
          }
        }
      }
      let orders = await Order.aggregate([
        {
          $facet: {
            results: [
              {
                $lookup: {
                    from: "orderdetails",
                    let: { orderdetailid: { $toObjectId: "$_id" } },
                    pipeline: [{ $match: { $expr: { $eq: ["$orderId", "$$orderdetailid"] } } },
                    {
                        $lookup: {
                            from: "users",
                            let: { userid: { $toObjectId: "$userId" } },
                            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userid"] } } }],
                            as: "buyer"
                        },
                    }, {
                        $unwind: {
                            path: "$buyer",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { sellerId: { $toObjectId: "$sellerId" } },
                            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$sellerId"] } } }],
                            as: "seller"
                        },
                    }, {
                        $unwind: {
                            path: "$seller",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "sellerproducts",
                            let: { sellerProductId: { $toObjectId: "$sellerProductId" } },
                            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$sellerProductId"] } } },
                            {
                                $lookup: {
                                    from: "products",
                                    let: { productId: { $toObjectId: "$productId" } },
                                    pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
                                    as: "product"
                                },
                            }, {
                                $unwind: {
                                    path: "$product",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $lookup: {
                                    from: "sellerproductimages",
                                    let: { id: { $toObjectId: "$_id" } },
                                    pipeline: [{ $match: { $expr: { $eq: ["$sellerProductId", "$$id"] } } }],
                                    as: "productImages"
                                },
                            },
                            ],
                            as: "sellerProduct"
                        },
                    }, {
                        $unwind: {
                            path: "$sellerProduct",
                            preserveNullAndEmptyArrays: true
                        }
                    },],
                    as: "orderDetails"
        
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
   
      return orders[0].results[0];
    } catch (error) {
      return {};
    }
  }


  exports.getAllSellerOrderOld = async (id) => {
    try {
        var oderDetails = OrderDetails.find({'sellerId': id})
      return oderDetails;
    } catch (error) {
      throw error
    }
  }

  exports.getAllSellerOrder = async (queryParams) => {
    try {
      const { sortBy } = queryParams
      const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
      const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
      const q = queryParams.q ? queryParams.q : ''
      const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
      const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
      const query = [{ }]
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
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            sellerId: mongoose.Types.ObjectId(queryParams.id) 
          }
        }
      }
      let orders = await OrderDetails.aggregate([
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
                  from: "sellerproductimages",
                  localField: "sellerproduct._id",
                  foreignField: "sellerProductId",
                  as: "sellerproduct.productImages"
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
               {
                $lookup: {
                  from: "users",
                  localField: "sellerId",
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
      return orders;
    } catch (error) {
      return [];
    }
  }



  exports.getSellerSpecificOrder = async (queryParams) => {
    try {
      const { sortBy } = queryParams
      const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
      const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
      const q = queryParams.q ? queryParams.q : ''
      const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
      const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
      const query = [{ }]
        
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
      if (queryParams.sellerId) {
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            sellerId: mongoose.Types.ObjectId(queryParams.sellerId) 
          }
        }
      }
      if (queryParams.id) {
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            _id: mongoose.Types.ObjectId(queryParams.id) 
          }
        }
      }
      let orders = await OrderDetails.aggregate([
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
                  from: "sellerproductimages",
                  localField: "sellerproduct._id",
                  foreignField: "sellerProductId",
                  as: "sellerproduct.productImages"
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
               {
                $lookup: {
                  from: "users",
                  localField: "sellerId",
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
      return orders[0].results[0];
    } catch (error) {
      return {};
    }
  }

  exports.getAllOrders= async (queryParams) => {
    try {
      const { sortBy } = queryParams
      const pageNo = queryParams.pageNo ? Number(queryParams.pageNo) : 1
      const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 10
      const q = queryParams.q ? queryParams.q : ''
      const order = queryParams.order && queryParams.order === 'desc' ? -1 : 1
      const skip = pageNo === 1 ? 0 : ((pageNo - 1) * pageSize)
      const query = [{ }]
        
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
      let orders = await OrderDetails.aggregate([
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
                  from: "sellerproductimages",
                  localField: "sellerproduct._id",
                  foreignField: "sellerProductId",
                  as: "sellerproduct.productImages"
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
              {
                $lookup: {
                  from: "users",
                  localField: "sellerId",
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
      return orders
    } catch (error) {
      throw error
    }
  }


  exports.exportOrders = async (queryParams, res) => {
    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("Orders"); // New Worksheet
    const path = "./uploads/files";  // Path to download excel
    // Column for data in excel. key must match data key
    let orders = await OrderDetails.aggregate([
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
                from: "sellerproductimages",
                localField: "sellerproduct._id",
                foreignField: "sellerProductId",
                as: "sellerproduct.productImages"
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
            {
              $lookup: {
                from: "users",
                localField: "sellerId",
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
          ],
          count: [
            { $count: 'totalCount' }]
        }
      }
    ])
    worksheet.columns = [
      { header: "S no.", key: "s_no", width: 10 }, 
      { header: "Buyer", key: "buyer", width: 30 },
      { header: "Seller", key: "seller", width: 30 },
      { header: "Product Name", key: "productName", width: 30 },
      { header: "Ammount", key: "ammount", width: 10 },
      { header: "Discount", key: "discount", width: 10 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Status", key: "status", width: 30 }

    ];
  let counter = 1;
  orders[0]['results'].forEach((order) => {
    var rowValues = [];
    rowValues[1] = counter;
    rowValues[2] = order.user.firstName + " " + order.user.lastName;
    rowValues[3] = order.seller.firstName + " " + order.seller.lastName
    rowValues[4] = order.sellerproduct.product.name;
    rowValues[5] = order.ammount;
    rowValues[6] = order.discount;
    rowValues[7] = order.quantity;
    rowValues[8] = order.status;
    const insertedRow = worksheet.insertRow(counter+1, rowValues);
    counter++;
  });
  // Making first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
    try {
      const data = await workbook.xlsx.writeFile(`${path}/orders.xlsx`);
      console.log(data);
      let response = {
        path: `files/orders.xlsx`,
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