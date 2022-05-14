const express = require("express");
const router = express.Router();

const CartServices = require('../services/cart_services');
const ProductServices = require('../services/product_services');

router.get('/', async (req, res) => { //get information from the session

    try {
        let cart = new CartServices(req.session.user.id);
        console.log("cart result log");
        console.log((await cart.getCart()).toJSON());
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
        let product = new ProductServices(req.params.product_id);
        let currProductQuantity = await product.getProductQuantity();
        if (currProductQuantity >= 1) {
            let remainingQty = parseInt(currProductQuantity) - 1
            let result = await product.updateProductQuantity(req.params.product_id, remainingQty); //it will return [qty, product_name]
            if (result) {
                let cart = new CartServices(req.session.user.id);
                await cart.addToCart(req.params.product_id, 1);
                req.flash('success_messages', 'Yay! Successfully added to cart')
                res.redirect('/products')
            } else {
                req.flash("error_messages", "error in result, cart not added")
                res.redirect('/products');
            }
        } else {
            req.flash("error_messages", "Not enough stock, cart not added")
            res.redirect('/products');
        }
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.get('/:product_id/:cart_quantity/remove', async (req, res) => {
    try {
        let cart = new CartServices(req.session.user.id);
        //update the cart stock 
        let updateQty = req.params.cart_quantity;
        let product = new ProductServices(req.params.product_id);
        let currProductQuantity = await product.getProductQuantity();
        if (currProductQuantity) {
            let remainingQty = parseInt(currProductQuantity) + parseInt(updateQty)
            let result = await product.updateProductQuantity(req.params.product_id, remainingQty); //it will return [qty, product_name]
            if (result) {
                await cart.remove(req.params.product_id);
                req.flash("success_messages", "Item has been removed");
                res.redirect('/cart/');
            }else{
                req.flash("error_messages", "removed unsuccessful");
                res.redirect('/cart/');
            }
        }else{
            req.flash("error_messages", "get quantity error, item has not been removed");
            res.redirect('/cart/');
        }
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.post('/:product_id/quantity/update', async (req, res) => {
    try {
        //implement quantity check 
        let updateQty = req.body.newQuantity;
        let product = new ProductServices(req.params.product_id);
        let currProductQuantity = await product.getProductQuantity();
        if (updateQty < 0) {
            req.flash("error_messages", "cannot set a negative value to update cart");
            res.redirect('/cart/');
        }

        if (currProductQuantity >= updateQty) {
            console.log("curr product quantity");
            console.log(currProductQuantity[0].qty);
            console.log("update qty");
            console.log(updateQty);
            let remainingQty = parseInt(currProductQuantity) - parseInt(updateQty)
            let result = await product.updateProductQuantity(req.params.product_id,remainingQty); //it will return [qty, product_name]
            if (result) {
                let cart = new CartServices(req.session.user.id);
                let result = await cart.setQuantity(req.params.product_id, req.body.newQuantity);
                req.flash("success_messages", "Quantity updated")
                res.redirect('/cart/');
            } else {
                req.flash("error_messages", "Result error, cart not updated")
                res.redirect('/cart/');
            }
        } else {
            req.flash("error_messages", "Not enough stock, cart not updated")
            res.redirect('/cart/');
        }

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

module.exports = router;