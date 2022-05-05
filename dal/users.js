const async = require('hbs/lib/async');
const { Product, RoastType, Certificate, Origin, User} = require('../models')

const getAllUsers = async () => {
    return User.fetchAll();
}

async function getUserById(userId){
    const user = await User.where({
        'id': userId
    }).fetch({
        'require': true
    })
    return user
}

module.exports = {
    getAllUsers, getUserById
}