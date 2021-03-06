const express = require('express');
const router = express.Router();
const CartServices = require('../../services/cart_services');
const UserServices = require('../../services/user_services');
const ProductServices = require('../../services/product_services');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order, Product, RoastType, Certificate, Origin, User } = require('../../models');
const { checkIfAuthenticatedJWT } = require('../../middlewares');
const productDataLayer = require('../../dal/products');
const userDataLayer = require('../../dal/users');

const bodyParser = require('body-parser');
let stripeData = null;
let user_id = null


//retrieve only the session id and publishable key
router.get('/:user_id', checkIfAuthenticatedJWT, async (req, res) => {
    try {
        console.log(1)
        console.log("user id");
        console.log(req.body);
        //1. Get all the cart items
        //hardcode the user id number 
        const cart = new CartServices(req.params.user_id);
        let items = await cart.getCart();

        //2. Generate the line items
        let lineItems = [];
        let meta = [];
        for (let item of items) {
            const lineItem = {
                'name': item.related('product').get('product_name'),
                'amount': item.related('product').get('price'),
                'quantity': item.get('quantity'),
                'currency': 'SGD'
            }

            //include image 
            if (item.related('product').get('image_url')) {
                lineItem['images'] = [item.related('product').get('image_url')]
            }
            lineItems.push(lineItem);
            // save the quantity data along with the product id
            meta.push({
                'product_id': item.get('product_id'),
                'quantity': item.get('quantity')
            })
        }

        // 3. Send the line items to Stripe and get a stripe payment id
        let metaData = JSON.stringify(meta);
        console.log(2)
        const payment = {
            payment_method_types: ['card'],    //eg card, crypto, cheque 
            line_items: lineItems,
            success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
            cancel_url: process.env.STRIPE_ERROR_URL,
            metadata: {
                'orders': metaData,
                'user_id': req.params.user_id
            }
        }

        // 4. register the session
        let stripeSession = await Stripe.checkout.sessions.create(payment)
        console.log(3)
        res.status(200);
        res.json({
            'sessionId': stripeSession.id, // 4. Get the ID of the session
            'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
        })
        //for testing purpose
        // res.render('checkout/checkout', {
        //     'sessionId': stripeSession.id, // 4. Get the ID of the session
        //     'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
        // })

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (get api)"
        })
        console.log(e);
    }

})

//When payment is successful
// router.get('/success', async function (req, res) {
//     try {
//         let date = new Date().toLocaleString("en-sg", {
//             timeZone: "Asia/Singapore",
//           });
//         let orderedProducts = [];

//         const cart = new CartServices(req.session.user.id);
//         let items = await cart.getCart();

//         let result;
//         for (let item of items) {
//             result = await cart.remove(item.get('product_id'))
//         }

//         //saving details to order table
        
//         //get user address
//         let user = new UserServices();
//         let userAddress = null;
//         let userData = await user.getUser(req.session.user.id)
//         userAddress = userData.attributes.address
//         console.log(userAddress);
//         //get product id
//         if (stripeData) {
//             console.log("Enter save order process");
//             orderedProducts = JSON.parse(stripeData.metadata.orders);
//             for(let element of orderedProducts){
//                 const order = new Order();
//                 const product = new ProductServices()
//                 let productRes = await product.getProductById(element.product_id);
//                 const user = new UserServices();
//                 let userRes = await user.getUserById(req.session.user.id);
//                 console.log(userRes.toJSON().address);
//                 // save order 
//                 order.set('product_id', element.product_id);
//                 order.set('user_id', req.session.user.id);
//                 order.set('order_date', date);
//                 order.set('status_id', 1);  //default stripeData.status
//                 order.set('shipping_address', userRes.toJSON().address);
//                 order.set('quantity', element.quantity);
//                 order.set('product_name', productRes.toJSON().product_name);
//                 order.set('product_image_url', productRes.toJSON().image_url);
//                 order.set('purchaser_name', userRes.toJSON().first_name); 
//                 await order.save();
//             }
//         }

       

//         //Need to clear the stripe data
//         stripeData = null;
        

//         if (result) {
//             res.render('checkout/success.hbs');
//         } else {
//             res.status(405);
//             res.json({
//                 'message': "method not allow"
//             })
//         }

//     } catch (e) {
//         res.status(500);
//         res.json({
//             'message': "Internal server error. Please contact administrator (success api)"
//         })
//         console.log(e);
//     }

// })

// router.get('/cancelled', function (req, res) {
//     res.render('checkout/cancelled')
// })


//process payment api
//what is the payload 
router.post('/process_payment', express.raw({
    'type': 'application/json'
}), async (req, res) => {
    //cannort use req.session.user.id from here 
    console.log("enter process payment api");
    let payload = req.body;
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers["stripe-signature"];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);

    } catch (e) {
        res.send({
            'error': e.message
        })
        console.log(e.message)
    }
    console.log(event);
    if (event.type == 'checkout.session.completed') {
        console.log("enter check session completed")
        let stripeSession = event.data.object;
        console.log(stripeSession);
        stripeData = stripeSession;
        // process stripeSession

        //start process save order 
        let date = new Date().toLocaleString("en-sg", {
            timeZone: "Asia/Singapore"
          });
        let orderedProducts = [];

        const cart = new CartServices(stripeSession.metadata.user_id);
        let items = await cart.getCart();

        let result;
        for (let item of items) {
            result = await cart.remove(item.get('product_id'))
        }

        //saving details to order table
        
        //get user address
        let user = new UserServices();
        let userAddress = null;
        let userData = await user.getUser(stripeSession.metadata.user_id)
        userAddress = userData.attributes.address
        console.log(userAddress);
        //get product id
        if (stripeData) {
            console.log("Enter save order process");
            orderedProducts = JSON.parse(stripeData.metadata.orders);
            for(let element of orderedProducts){
                const order = new Order();
                const product = new ProductServices()
                let productRes = await product.getProductById(element.product_id);
                const user = new UserServices();
                let userRes = await user.getUserById(stripeSession.metadata.user_id);
                console.log(userRes.toJSON().address);
                // save order 
                order.set('product_id', element.product_id);
                order.set('user_id', stripeSession.metadata.user_id);
                order.set('order_date', date);
                order.set('status_id', 1); //stripeSession.payment_status
                order.set('shipping_address', userRes.toJSON().address);
                order.set('quantity', element.quantity);
                order.set('product_name', productRes.toJSON().product_name);
                order.set('product_image_url', productRes.toJSON().image_url);
                order.set('purchaser_name', userRes.toJSON().first_name); 
                await order.save();
            }
        }

       

        //Need to clear the stripe data
        stripeData = null;

    }






    res.send({ received: true });
})


module.exports = router;