const async = require('hbs/lib/async');
const { Product, RoastType, Certificate, Origin, User, Order} = require('../models')

async function getUserOrder(userId){
    const order = await Order.where({
        'user_id': userId
    }).fetchAll({
        'require': true
    })
    return order;
} 

module.exports = {
    getUserOrder
}
