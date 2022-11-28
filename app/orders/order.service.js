/* eslint-disable no-useless-catch */
const { ErrorHandler } = require('../../helpers/ErrorHandler')
const { BAD_REQUEST, NOT_FOUND } = require('../../helpers/HTTP.CODES')
const Order = require('./order.model')
const { validOrderDetailSchema } = require('../../helpers/validation.schema')
const { validOrderSchema } = require('../../helpers/validation.schema')
const OrderDetails = require('./orderDetail.model')
const { default: mongoose } = require('mongoose')


exports.create = async (data) => {
    try {
    //   const { error } = validOrderSchema(data)
    //   if (error) {
    //     throw ErrorHandler(error.message, BAD_REQUEST)
    //   }
      const order = new Order()
      order.totalAmmount = data.totalAmmount;
      order.discount = data.discount;
      order.userId = data.userId;
      order.notes = data.notes;
      await order.save()
      if(data && data.orderList.length > 0){
        await data.orderList.forEach(elem => {
          let orderDetails = new OrderDetails();
          orderDetails.ammount = elem.ammount;
          orderDetails.quantity = elem.quantity;
          orderDetails.discount = elem.discount;
          orderDetails.userId = elem.userId;
          orderDetails.sellerProductId = elem.sellerProductId;
          orderDetails.sellerId = elem.sellerId;
          orderDetails.notes = elem.notes;
          orderDetails.orderId = order._id;
          orderDetails.save();
        })
      }
     
      return true;
    } catch (error) {
      throw error
    }
  }


  exports.getAllUserOrderOld = async (id) => {
    try {
      var orders = Order.find({'userId': id})
    //   var updatedOrders = orders; //JSON.parse(JSON.stringify(orders));
    //   console.log(updatedOrders);
    //   if(updatedOrders && updatedOrders.length > 0)
    //   { 
    //     console.log(updatedOrders);
    //     await updatedOrders.forEach(elem =>{
    //         console.log(elem._id);
    //         let oderDetails = OrderDetails.find({'orderId': elem._id})
    //         if(oderDetails && oderDetails.length > 0){
    //             updatedOrders['oderDetails'] = oderDetails;
    //         }
    //     })
    //   }
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
        
    console.log(queryParams);
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
        console.log(queryParams.userId);
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            userId: mongoose.Types.ObjectId(queryParams.userId) 
          }
        }
        console.log(pipline);
      }

      if (queryParams.orderId) {
        console.log(queryParams.orderId);
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            _id: mongoose.Types.ObjectId(queryParams.orderId) 
          }
        }
        console.log(pipline);
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
    //   orders = JSON.parse(JSON.stringify(orders))
  
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
        
    console.log(queryParams);
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
      // if (queryParams.userId) {
      //   console.log(queryParams.userId);
      //   pipline[matchIndex] = {
      //     $match: {
      //       ...pipline[matchIndex].$match,
      //       userId: mongoose.Types.ObjectId(queryParams.userId) 
      //     }
      //   }
      //   console.log(pipline);
      // }

      if (queryParams.id) {
        console.log(queryParams.id);
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            _id: mongoose.Types.ObjectId(queryParams.id) 
          }
        }
        console.log(pipline);
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
    //   orders = JSON.parse(JSON.stringify(orders))
  
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
     
      return orders[0].results[0];
    } catch (error) {
      return {};
      // throw error
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
        
    console.log(queryParams);
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
        console.log(queryParams.id);
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            sellerId: mongoose.Types.ObjectId(queryParams.id) 
          }
        }
        // console.log(pipline);
      }
      // if (queryParams.id) {
      //   console.log(queryParams.id);
      //   pipline[matchIndex] = {
      //     $match: {
      //       ...pipline[matchIndex].$match,
      //       sellerId: mongoose.Types.ObjectId(queryParams.id) 
      //     }
      //   }
      //   // console.log(pipline);
      // }
      // if (queryParams.orderDetailId) {
      //   console.log(queryParams.orderDetailId);
      //   pipline[matchIndex] = {
      //     $match: {
      //       ...pipline[matchIndex].$match,
      //       _id: mongoose.Types.ObjectId(queryParams.orderDetailId) 
      //     }
      //   }
      //   console.log(pipline);
      // }
      // if (queryParams.orderId) {
      //   console.log(queryParams.orderId);
      //   pipline[matchIndex] = {
      //     $match: {
      //       ...pipline[matchIndex].$match,
      //       _id: mongoose.Types.ObjectId(queryParams.orderId) 
      //     }
      //   }
      //   console.log(pipline);
      // }
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
    //   orders = JSON.parse(JSON.stringify(orders))
  
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
        
    console.log(queryParams);
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
        console.log(queryParams.sellerId);
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            sellerId: mongoose.Types.ObjectId(queryParams.sellerId) 
          }
        }
        console.log(pipline);
      }
      // if (queryParams.userId) {
      //   console.log(queryParams.userId);
      //   pipline[matchIndex] = {
      //     $match: {
      //       ...pipline[matchIndex].$match,
      //       sellerId: mongoose.Types.ObjectId(queryParams.userId) 
      //     }
      //   }
      //   console.log(pipline);
      // }
      if (queryParams.id) {
        console.log(queryParams.id);
        pipline[matchIndex] = {
          $match: {
            ...pipline[matchIndex].$match,
            _id: mongoose.Types.ObjectId(queryParams.id) 
          }
        }
        console.log(pipline);
      }
      // if (queryParams.orderId) {
      //   console.log(queryParams.orderId);
      //   pipline[matchIndex] = {
      //     $match: {
      //       ...pipline[matchIndex].$match,
      //       _id: mongoose.Types.ObjectId(queryParams.orderId) 
      //     }
      //   }
      //   console.log(pipline);
      // }
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
    //   orders = JSON.parse(JSON.stringify(orders))
  
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
        
    console.log(queryParams);
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
    //   orders = JSON.parse(JSON.stringify(orders))
  
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
     
      return orders
    } catch (error) {
      throw error
    }
  }