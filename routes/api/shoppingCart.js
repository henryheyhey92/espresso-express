const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const { checkIfAuthenticatedJWT } = require('../../middlewares');

const CartServices = require('../../services/cart_services');
const ProductServices = require('../../services/product_services');

// retrieve api 
router.get('/:user_id', async (req, res) => {
    try {
        console.log("Get cart items api");
        let cart = new CartServices(req.params.user_id);
        let result = (await cart.getCart()).toJSON();
        console.log("cart result log");
        console.log(result);
        res.status(200);
        res.send(result);
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

//Add cart item
// user_id from req.body and the product_id
router.post('/additem', checkIfAuthenticatedJWT, async (req, res) => {
    console.log("Print test authorization");
    console.log(req.headers.authorization);
    try {
        let { user_id, product_id } = req.body;
        let cart = new CartServices(user_id);
        let result = await cart.addToCart(product_id, 1);
        res.status(200);
        res.json({
            "result": result
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

//delete or remove item from cart
router.post('/remove/item', checkIfAuthenticatedJWT, async (req, res) => {
    try {
        let { user_id, product_id, cart_quantity } = req.body;
        let cart = new CartServices(user_id);
        //update the cart stock 
        let product = new ProductServices(product_id);
        let totalCurrProdQty = await product.getProductQuantity();
        if (totalCurrProdQty) {
            let qtyTobeUpdate = parseInt(totalCurrProdQty[0].qty) + parseInt(cart_quantity)
            let result = await product.updateProductQuantity(product_id, qtyTobeUpdate); //it will return
            if (result) {
                await cart.remove(product_id);
                res.status(200);
                res.json({
                    "result": true
                })
            } else {
                res.status(400);
                res.json({
                    "result": "Bad request (shopping cart js remove item from cart)"
                })
            }
        } else {
            res.status(400);
            res.json({
                "result": "Bad request (shopping cart js, unable to query inventory qty)"
            })
        }
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})



//Update quantity 
router.put('/:product_id/:quantity/update', async (req, res) => {
    try {
        let { user_id } = req.body;
        let cart = new CartServices(user_id);
        let result = await cart.setQuantity(req.params.product_id, req.params.quantity);
        res.status(200);
        res.json({
            "result": result
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})
module.exports = router;