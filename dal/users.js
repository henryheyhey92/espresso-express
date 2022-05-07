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

async function getUserByEmail(user_email){
    const user = await User.where({
        'email': user_email
    }).fetch({
        require: false
    })
    return user
}

module.exports = {
    getAllUsers, getUserById, getUserByEmail
}