const express = require("express");
const router = express.Router();

const { Product, RoastType, Certificate, Origin, Order, OrderStatus } = require('../models');
const OrderServices = require('../services/order_services');
const UserServices = require('../services/user_services');
const ProductServices = require('../services/product_services');
const { checkIfAuthenticated, checkIfManagerOwnerAuthenticated } = require('../middlewares');


const { } = require('../middlewares');
const { bootstrapField, createOrderForm, updateStatusForm, createSearchOrderForm } = require("../forms");
const { knex } = require("../bookshelf");


router.get('/all/', async (req, res) => {
    try {
        const allProduct = await new ProductServices().getProductName();
        const allUser = await new UserServices().getAllUserName();
        const allOrderStatus = await new OrderServices().getAllOrderStatus();
        
        allUser.unshift(["", "All"]);
        let order = new OrderServices();
        let orderResult = await order.getAllUserOrder();

        let searchForm = createSearchOrderForm(allProduct, allUser, allOrderStatus);
        let q = Order.collection();

        searchForm.handle(req, {
            'empty': async (form) => {
                res.render('orders/index', {
                    'orders': orderResult.toJSON(),
                    'form': form.toHTML(bootstrapField)
                })
            },
            'error': async (form) => {
                res.render('orders/index', {
                    'orders': orderResult.toJSON(),
                    'form': form.toHTML(bootstrapField)
                })
            },
            'success': async (form) => {
                if (form.data.product_name) {
                    q = q.where('product_name', 'like', '%' + req.query.product_name + '%')
                }

                //example code
                // if (form.data.roast_type_id && form.data.roast_type_id != "0") {
                //     q = q.query('join', 'roast_type', 'roast_type_id', 'roast_type.id')
                //         .where('roast_type.name', 'like', '%' + req.query.roast_type_id + '%')
                // }
                if (form.data.status_id) {
                    q = q.where('status_id', 'like', form.data.status_id)
                }

                // form.data.purchaser_name is the id
                if (form.data.purchaser_name) {
                    q = q.where('user_id', '=', form.data.purchaser_name)
                }


                let order = await q.fetch();
                res.render('orders/index', {
                    'orders': order.toJSON(),
                    'form': form.toHTML(bootstrapField)
                })

            }
        })

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (order routes)"
        })
        console.log(e);
    }
})

router.get('/add', async (req, res) => {
    try {
        const allProduct = await new ProductServices().getProductName();
        const allUser = await new UserServices().getAllUserName();
        const allOrderStatus = await new OrderServices().getAllOrderStatus();
        const orderForm = createOrderForm(allProduct, allUser, allOrderStatus);

        res.render('orders/create.hbs', {
            'form': orderForm.toHTML(bootstrapField)
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (order routes for add)"
        })
        console.log(e);
    }
})

router.post('/add', async (req, res) => {
    try {
        const allProduct = await new ProductServices().getProductName();
        const allUser = await new UserServices().getAllUserName();
        const allOrderStatus = await new OrderServices().getAllOrderStatus();
        const orderForm = createOrderForm(allProduct, allUser, allOrderStatus);

        /******* please note that form.data.product_name is product_id for this instance*****/

        orderForm.handle(req, {
            'success': async (form) => {
                let productName = null;
                let purchaserName = null;
                let checkQty = null;
                let temp = null;
                // example code
                // temp.forEach(element => {
                //     productName = element.product_name
                // });

                //get product name 
                temp = await knex.select('product_name').from('products').where({ id: form.data.product_name });
                productName = temp[0].product_name

                //get purchaser name
                temp = await knex.select('first_name').from('users').where({ id: form.data.purchaser_name });
                purchaserName = temp[0].first_name

                //get check product qty
                temp = await knex.select('qty').from('products').where({ id: form.data.product_name }).andWhere('qty', '>=', parseInt(form.data.quantity));
                checkQty = temp[0].qty

                //substract inventory product qty

                if (checkQty && productName && purchaserName) {
                    let product = new ProductServices(form.data.product_name);
                    let quantity = await product.getProductQuantity();
                    console.log("get product quantity");
                    console.log(quantity[0].qty);
                    console.log("get form quantity");
                    console.log(form.data.quantity);
                    let updateQuantity = quantity[0].qty - parseInt(form.data.quantity);
                    let updateRes = await product.updateProductQuantity(form.data.product_name, updateQuantity);
                    console.log("updateQuantity");
                    console.log(updateQuantity);
                    console.log("update result");
                    console.log(updateRes);

                    let addOrder = {
                        "product_id": form.data.product_name,
                        "user_id": form.data.purchaser_name,
                        "order_date": new Date().toLocaleString("en-sg", { timeZone: "Asia/Singapore" }),
                        "status_id": form.data.status_id, // === 1 ? "complete" : ((form.data.status === 2) ? "incomplete" : "delievered"),
                        'shipping_address': form.data.shipping_address,
                        "quantity": form.data.quantity,
                        "product_name": productName,
                        "purchaser_name": purchaserName,
                        "product_image_url": null
                    }
                    const orderObj = new OrderServices();
                    await orderObj.saveOrder(addOrder);
                    req.flash("success_messages", `New Order for ${purchaserName} has been created`)
                    res.redirect('/orders/all');
                    addOrder = {};
                } else {
                    req.flash("error_messages", `New Order not created`)
                    res.redirect('/orders/add');
                }

            },
            'error': async (form) => {
                res.render('orders/create', {
                    'form': form.toHTML(bootstrapField)
                })
            }
        })

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (order routes for add)"
        })
        console.log(e);
    }
})

router.get('/:id/update', async (req, res) => {
    try {
        const allProduct = await new ProductServices().getProductName();
        const allUser = await new UserServices().getAllUserName();
        const allOrderStatus = await new OrderServices().getAllOrderStatus();
        let orderObj = new OrderServices();
        let orderRes = await orderObj.getOrderById(req.params.id);
        const form = updateStatusForm(allOrderStatus)
        //take note of the changes
        let temp = orderRes.get('status_id'); //take note
        form.fields.status_id.value = temp; //(temp === "complete" ? 1 : ((temp === "incomplete") ? 2 : 3));
        res.render('orders/update', {
            'orders': orderRes.toJSON(),
            'form': form.toHTML(bootstrapField)
        })

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.post('/:id/update', async (req, res) => {
    try {
        const allProduct = await new ProductServices().getProductName();
        const allUser = await new UserServices().getAllUserName();
        const allOrderStatus = await new OrderServices().getAllOrderStatus();

        let orderObj = new OrderServices();
        let orderRes = await orderObj.getOrderById(req.params.id);
        console.log("orderRes info");
        console.log(orderRes);
        const form = updateStatusForm(allOrderStatus);

        form.handle(req, {
            'success': async (form) => {
                // form.data.status === 1 ? "complete" : ((form.data.status === 2) ? "incomplete" : "delievered")
                console.log(typeof (form.data.status_id))
                //need to take note
                orderRes.set("status_id", form.data.status_id); //(form.data.status === "1" ? "complete " : ((form.data.status === "2") ? "incomplete" : "delievered"))
                orderRes.save();
                res.redirect('/orders/all');
            },
            'error': async (form) => {
                res.render('orders/update', {
                    'orders': orderRes.toJSON(),
                    'form': form.toHTML(bootstrapField)
                })
            }
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.get('/:id/delete', async (req, res) => {
    try {
        let orderObj = new OrderServices();
        let orderRes = await orderObj.getOrderById(req.params.id);

        res.render('orders/delete.hbs', {
            'orders': orderRes.toJSON()
        })

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (get delete)"
        })
        console.log(e);
    }
})

router.post('/:id/delete', async (req, res) => {
    try {
        //get order
        let orderObj = new OrderServices();
        const orderRes = await orderObj.getOrderById(req.params.id);
        console.log("order Res");
        console.log(orderRes.toJSON());
        //get product and qunatity
        let product = new ProductServices(orderRes.toJSON().product_id);
        
        let quantity = await product.getProductQuantity();
        console.log("quantity");
        console.log(quantity);
        //update inventory product
        let updateQuantity = quantity[0].qty + orderRes.toJSON().quantity;
        let updateRes = await product.updateProductQuantity(orderRes.toJSON().product_id, updateQuantity);
        console.log("Update Res");
        console.log(updateRes);
        if(updateRes){
            await orderRes.destroy();
            res.redirect('/orders/all');
        }else{
            req.flash("error_messages", `Order cannot be deleted`)
            res.redirect('/orders/all');
        }
       
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
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