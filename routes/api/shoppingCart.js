const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const { checkIfAuthenticatedJWT } = require('../../middlewares');

const CartServices = require('../../services/cart_services');


// retrieve api 
router.get('/:user_id', async (req, res) => {
    try {
        let cart = new CartServices(req.params.user_id);
        let result = (await cart.getCart()).toJSON();
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
router.post('/:product_id/remove', async (req, res) => {
    try {
        let { user_id } = req.body;
        let cart = new CartServices(user_id);
        let result = await cart.remove(req.params.product_id);
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