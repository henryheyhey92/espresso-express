const express = require("express");
const router = express.Router();

const CartServices = require('../services/cart_services');

router.get('/', async (req, res) => { //get information from the session

    try {
        let cart = new CartServices(req.session.user.id);
        res.render('carts/index', {
            'shoppingCart': (await cart.getCart()).toJSON()
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.get('/:product_id/add', async (req, res) => {
    try {
        let cart = new CartServices(req.session.user.id);
        await cart.addToCart(req.params.product_id, 1);
        req.flash('success_messages', 'Yay! Successfully added to cart')
        res.redirect('/products')
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.get('/:product_id/remove', async (req, res) => {
    try {
        let cart = new CartServices(req.session.user.id);
        await cart.remove(req.params.product_id);
        req.flash("success_messages", "Item has been removed");
        res.redirect('/cart/');
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.post('/:product_id/quantity/update', async (req, res) => {
    try{
        let cart = new CartServices(req.session.user.id);
        let result = await cart.setQuantity(req.params.product_id, req.body.newQuantity);
        req.flash("success_messages", "Quantity updated")
        res.redirect('/cart/');
    }catch (e){
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

module.exports = router;