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

async function getAllUser(){
    const user = await User.collection().fetch();
    return user;
}

async function getAllUserName(){
    const user = await User.fetchAll().map(user => {
        return [user.get('id'), user.get('first_name')]
    })
    return user;
}


module.exports = {
    getAllUsers, getUserById, getUserByEmail, getAllUser, getAllUserName
}