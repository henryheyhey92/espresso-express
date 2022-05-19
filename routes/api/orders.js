const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const { checkIfAuthenticatedJWT } = require('../../middlewares');

const OrderServices = require('../../services/order_services');
const UserServices = require('../../services/user_services');
const ProductServices = require('../../services/product_services');


router.get('/result/:user_id', async (req, res) => {
    try {
        
        let order = new OrderServices();
        let orderResult = await order.getAllUserOrder();
        console.log("orderResult");
        console.log(orderResult.toJSON());
        if(orderResult){
            res.status(200);
            res.send(orderResult);
        }

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (order routes)"
        })
        console.log(e);
    }
})




// router.post('/get/status', async (req, res) => {
//     const allOrderStatus = await OrderStatus.fetchAll().map((status) => {
//         return [status.get('id'), category.get('status_type')]
//     })
//     return allOrderStatus
// })



module.exports = router;