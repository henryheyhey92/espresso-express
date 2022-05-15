const express = require("express");
const router = express.Router();

const CartServices = require('../services/cart_services');
const ProductServices = require('../services/product_services');

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
        let product = new ProductServices(req.params.product_id);
        let totalCurrProdQty = await product.getProductQuantity();
        if (totalCurrProdQty[0].qty >= 1) {
            let qtyToBeUpdate = parseInt(totalCurrProdQty[0].qty) - 1
            let result = await product.updateProductQuantity(req.params.product_id, qtyToBeUpdate); //it will return 
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
        let totalCurrProdQty = await product.getProductQuantity();
        if (totalCurrProdQty) {
            let qtyTobeUpdate = parseInt(totalCurrProdQty[0].qty) + parseInt(updateQty)
            let result = await product.updateProductQuantity(req.params.product_id, qtyTobeUpdate); //it will return
            if (result) {
                await cart.remove(req.params.product_id);
                req.flash("success_messages", "Item has been removed");
                res.redirect('/cart/');
            } else {
                req.flash("error_messages", "removed unsuccessful");
                res.redirect('/cart/');
            }
        } else {
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
        let updateInventoryQty = 0;
        let setQty = null;
        let diff = null;
        //current cart product quantity
        let cart = new CartServices(req.session.user.id);
        let currentCartQty = await cart.getCurrProductCartQuantity(req.params.product_id); //uses knex query 

        //the quantity that user want to update to 
        let updateQty = req.body.newQuantity;

        //quantity in the inventory
        let product = new ProductServices(req.params.product_id);
        let totalCurrProdQty = await product.getProductQuantity();  //total current quantity, use kenx query

        if (currentCartQty[0].quantity >= updateQty && (updateQty > 0)) {
            diff = parseInt(currentCartQty[0].quantity) - parseInt(updateQty);
            updateInventoryQty = parseInt(totalCurrProdQty[0].qty) + diff;
        } else {
            if (updateQty <= 0) {
                req.flash("error_messages", "cannot set a zero value or negative value to update cart");
                res.redirect('/cart/');
            } else {
                diff = parseInt(updateQty) - parseInt(currentCartQty[0].quantity);
                updateInventoryQty = parseInt(totalCurrProdQty[0].qty) - diff;
            }
        }

        if (updateInventoryQty < 0) {
            req.flash("error_messages", "product stock insufficient, cart not updated")
            res.redirect('/cart/');
        }else{
            setQty = await cart.setQuantity(req.params.product_id, req.body.newQuantity);

            if (setQty) {
                let result = await product.updateProductQuantity(req.params.product_id, updateInventoryQty); //it will return [qty, product_name]
                if (result) {
                    req.flash("success_messages", "Quantity updated")
                    res.redirect('/cart/');
                }
            } else {
                req.flash("error_messages", ", set quantity error, cart not updated")
                res.redirect('/cart/');
            }
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