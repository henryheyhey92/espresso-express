const { CartItem } = require('../models');
const { knex } = require("../bookshelf");

const getCart = async (userId) => {
    return await CartItem.collection()
        .where({
            'user_id': userId
        }).orderBy('id').fetch({
            require: false, //for case user never add anything
            withRelated: ['product', 'product.roastType']
        });
}

const checkCartIfContainProduct = async (productId) => {
    return await CartItem.where({
        'product_id': productId
    }).fetchAll({
        require: false,
        withRelated: ['product', 'product.roastType']
    })
}

const getCartItemByUserAndProduct = async (userId, productId) => {
    return await CartItem.where({
        'user_id': userId,
        'product_id': productId
    }).fetch({
        require: false
    });
}

async function createCartItem(userId, productId, quantity) {

    let cartItem = new CartItem({
        'user_id': userId,
        'product_id': productId,
        'quantity': quantity
    })
    await cartItem.save();
    return cartItem;
}

async function removeFromCart(userId, productId) {
    let cartItem = await getCartItemByUserAndProduct(userId, productId);
    if (cartItem) {
        await cartItem.destroy();
        return true;
    }
    return false;
}

async function removeAllFromCart(userId) {
    let cartItem = await getCart(userId);
    if (cartItem) {
        await cartItem.destroy();
        return true;
    }
    return false;
}

async function updateQuantity(userId, productId, newQuantity) {
    try {
        let cartItem = await getCartItemByUserAndProduct(userId, productId);

        if (cartItem) {
            cartItem.set('quantity', newQuantity);
            cartItem.save();
            return true;
        }
        return false;
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (cart items)"
        })
        console.log(e);
    }

}

async function getCurrProductCartQuantity(productId, userId) {
    try {
        const quantity = await knex.select('quantity').from('cart_items').where(
            { user_id: userId, product_id: productId });
        return quantity;
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (cart items)"
        })
        console.log(e);
    }

}


module.exports = {
    getCart,
    getCartItemByUserAndProduct,
    createCartItem,
    removeFromCart,
    updateQuantity,
    removeAllFromCart,
    getCurrProductCartQuantity,
    checkCartIfContainProduct
}