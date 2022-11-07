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


  exports.getAllUserOrder = async (id) => {
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


  exports.getAllSellerOrder = async (id) => {
    try {
        var oderDetails = OrderDetails.find({'sellerId': id})
      return oderDetails;
    } catch (error) {
      throw error
    }
  }