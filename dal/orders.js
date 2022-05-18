const async = require('hbs/lib/async');
const { Product, RoastType, Certificate, Origin, User, Order, OrderStatus} = require('../models')

async function getUserOrder(userId){
    const order = await Order.where({
        'user_id': userId
    }).fetchAll({
        'require': true
    })
    return order;
} 

async function getAllUserOrder(){
    return await Order.fetchAll();
}

async function saveOrder(orderObj){
    const product = new Order();
    await product.save(orderObj)
    
}

async function getOrderById(orderId){
    const order = await Order.where({
        'id': orderId
    }).fetch();
    return order;
}

async function getAllOrderStatus(){
    const allOrderStatus = await OrderStatus.fetchAll().map((status) => {
        return [status.get('id'), status.get('status_type')]
    })
    return allOrderStatus
}

module.exports = {
    getUserOrder, getAllUserOrder, saveOrder, getOrderById, getAllOrderStatus
}
