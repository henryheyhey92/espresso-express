const express = require("express");
const router = express.Router();

const { Product, RoastType, Certificate, Origin, Order } = require('../models');
const OrderServices = require('../services/order_services');
const UserServices = require('../services/user_services');
const ProductServices = require('../services/product_services');
const { checkIfAuthenticated, checkIfManagerOwnerAuthenticated } = require('../middlewares');


const { } = require('../middlewares');
const { bootstrapField, createOrderForm, updateStatusForm, createSearchOrderForm } = require("../forms");
const { knex } = require("../bookshelf");


router.get('/all/', async (req, res) => {
    try {
        //create order obj
        const allProduct = await new ProductServices().getProductName();
        const allUser = await new UserServices().getAllUserName();
        allUser.unshift(["", "All"]);
        let order = new OrderServices();
        let orderResult = await order.getAllUserOrder();

        let searchForm = createSearchOrderForm(allProduct, allUser);
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

                // if (form.data.roast_type_id && form.data.roast_type_id != "0") {
                //     q = q.query('join', 'roast_type', 'roast_type_id', 'roast_type.id')
                //         .where('roast_type.name', 'like', '%' + req.query.roast_type_id + '%')
                // }
                if (form.data.status) {
                    let status = (form.data.status === "1" ? "complete" : ((form.data.status === "2") ? "incomplete" : (form.data.status === "3") ? "delievered" : ""))
                    if(status !== ""){
                        q = q.where('status', 'like', status)
                    }
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

        // res.status(200);
        // // res.send(orderResult);
        // res.render('orders/index', {
        //     'orders': orderResult.toJSON()
        // })

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
        const orderForm = createOrderForm(allProduct, allUser);

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
        const orderForm = createOrderForm(allProduct, allUser);

        orderForm.handle(req, {
            'success': async (form) => {
                let productName = null;
                let purchaserName = null;
                let checkQty = null;
                let temp = null;
                console.log("product name")
                console.log(form.data.product_name)
                temp = await knex.select('product_name').from('products').where({ id: form.data.product_name });
                temp.forEach(element => {
                    productName = element.product_name
                });
                // console.log(productId)

                temp = await knex.select('first_name').from('users').where({ id: form.data.purchaser_name });
                temp.forEach(element => {
                    purchaserName = element.first_name
                })
                // console.log(userId)

                temp = await knex.select('qty')
                    .from('products')
                    .where({ id: form.data.product_name })
                    .andWhere('qty', '>', parseInt(form.data.quantity));

                temp.forEach(element => {
                    checkQty = element.qty
                })


                if (checkQty) {
                    let addOrder = {
                        "product_id": form.data.product_name,
                        "user_id": form.data.purchaser_name,
                        "order_date": new Date(),
                        "status": form.data.status === 1 ? "complete" : ((form.data.status === 2) ? "incomplete" : "delievered"),
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
        let orderObj = new OrderServices();
        let orderRes = await orderObj.getOrderById(req.params.id);
        const form = updateStatusForm()
        let temp = orderRes.get('status')
        form.fields.status.value = (temp === "complete" ? 1 : ((temp === "incomplete") ? 2 : 3));
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
        let orderObj = new OrderServices();
        let orderRes = await orderObj.getOrderById(req.params.id);
        const form = updateStatusForm();

        form.handle(req, {
            'success': async (form) => {
                // form.data.status === 1 ? "complete" : ((form.data.status === 2) ? "incomplete" : "delievered")
                console.log(typeof(form.data.status))
                orderRes.set("status", (form.data.status === "1" ? "complete " : ((form.data.status === "2") ? "incomplete" : "delievered")));
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
        let orderObj = new OrderServices();
        const orderRes = await orderObj.getOrderById(req.params.id);
        await orderRes.destroy();
        res.redirect('/orders/all');
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})



module.exports = router;