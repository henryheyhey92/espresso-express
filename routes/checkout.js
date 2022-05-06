const express = require('express');
const { checkIfAuthenticated } = require('../middlewares');
const router = express.Router();

const CartServices = require('../services/cart_services')
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

router.get('/', async (req, res) => {
    //1. Get all the cart items
    const cart = new CartServices(req.session.user.id);
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
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id, // 4. Get the ID of the session
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })

})

router.get('/success', async function (req, res) {
    try {
        console.log("the session user id");
        // res.render('checkout/success')
        console.log(req.session.user.id);
        const cart = new CartServices(req.session.user.id);

        let items = await cart.getCart();

        let result;
        for (let item of items) {
            result = await cart.remove(item.get('product_id'))
        }

        if (result) {
            res.render('checkout/success')
        } else {
            res.status(405);
            res.json({
                'message': "method not allow"
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

router.get('/cancelled', function (req, res) {
    res.render('checkout/cancelled')
})


router.post('/process_payment', express.raw({
    'type':'application/json'
}), async (req, res) => {
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
    if (event.type == 'checkout.session.completed') {
        let stripeSession = event.data.object;
        console.log(stripeSession);
        // process stripeSession
    }
    res.send({ received: true });
})



module.exports = router;