const express = require("express");
const router = express.Router();

const { Product, RoastType, Certificate, Origin, Order } = require('../models');
const OrderServices = require('../services/order_services');
const UserServices = require('../services/user_services');
const ProductServices = require('../services/product_services');
const { checkIfAuthenticated } = require('../middlewares');

const {} = require('../middlewares');
const { bootstrapField } = require("../forms");


router.get('/all/', checkIfAuthenticated, async (req, res) => {
    try{
        //create order obj
        let orderArray = [];
        let order = new OrderServices(req.session.user.id);
        let orderResult = await order.getAllUserOrder();
        
        
        // if(orderResult){
           
        //     //get user name
        //     console.log("userinfo result");
        //     let user = new UserServices();
        //     let userInfo = await user.getUserById(req.session.user.id);

            
        //     console.log(userInfo.toJSON());
        //     console.log("orderinfo result");
        //     let orderResultJSON = orderResult.toJSON();
        //     orderResultJSON.forEach(element => {
        //         //append product name 
        //         Object.assign(element, {product_name:userInfo.toJSON().first_name});
        //         Object.assign(element, )
        //     });
        //     console.log(orderResultJSON);
        // }
         
        res.status(200);
        // res.send(orderResult);
        res.render('orders/index', {
            'orders': orderResult.toJSON()
        })

    }catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (order routes)"
        })
        console.log(e);
    }
})

module.exports = router;