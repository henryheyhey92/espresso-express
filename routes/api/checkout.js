const express = require('express');
const router = express.Router();
const CartServices = require('../../services/cart_services');
const UserServices = require('../../services/user_services');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const {Order, Product, RoastType, Certificate, Origin} = require('../../models');
const dataLayer = require('../../dal/products');



//retrieve only the session id and publishable key
router.get('/', async (req, res) => {
    try {
        console.log(1)
        //1. Get all the cart items
        //hardcode the user id number 
        const cart = new CartServices(1);
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
                'orders': metaData
            }
        }

        // 4. register the session
        let stripeSession = await Stripe.checkout.sessions.create(payment)
        console.log(3)
        res.status(200);
        // res.json({
        //     'sessionId': stripeSession.id, // 4. Get the ID of the session
        //     'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
        // })
        //for testing purpose
        res.render('checkout/checkout', {
            'sessionId': stripeSession.id, // 4. Get the ID of the session
            'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
        })

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (get api)"
        })
        console.log(e);
    }

})

//When payment is successful
router.get('/success', async function (req, res) {
    try {
        
        //let {user_id} = req.body;
        //hardcode for now 
        console.log(4)
        const cart = new CartServices(1);
        let items = await cart.getCart();

        let result;
        for (let item of items) {
            result = await cart.remove(item.get('product_id'))
        }

        if (result) {
            res.render('checkout/success');
        } else {
            res.status(405);
            res.json({
                'message': "method not allow"
            })
        }

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (success api)"
        })
        console.log(e);
    }

})


//process payment api
//what is the payload 
router.post('/process_payment', express.raw({
    'type':'application/json'
}), async (req, res) => {
    console.log("hello 5")
    let payload = req.body;
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers["stripe-signature"];
    let event;
    try {
        console.log("hello2")

        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);

    } catch (e) {
        res.send({
            'error': e.message
        })
        console.log(e.message)
    }
    if (event.type == 'checkout.session.completed') {

        let date = new Date();
        let stripeSession = event.data.object;
        console.log(stripeSession);
        
        //get product id
        let orderedProducts = stripeSession.metadata;
        //get total cost
        let totalCost = stripeSession.amount_total;

        //get user address
        let user = new UserServices();
        let result = user.getUser(req.session.user.id);
        console.log(result);
        // let userAddress = 
        
        // const order = new Order();
        // order.set('product_id', 10);
        // order.set('user_id', req.session.user.id);
        // order.set('order_date', date.toString());
        // order.set('status', "paid");
        // order.set('shipping_address', "Bukit Panjang Ring Road");
        // order.set('quantity', 4);
        // await order.save();

        // process stripeSession
    }
   
    res.send({ received: true });
})


module.exports = router;