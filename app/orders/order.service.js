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
          sellerIdsList.push(elem.sellerId);
          orderDetails.save();
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