const express = require('express');
const router = express.Router();
const CartServices = require('../../services/cart_services');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


//retrieve only the session id and publishable key
router.get('/:user_id', async (req, res) => {
    try {

        //1. Get all the cart items
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
        res.status(200);
        res.json({
            'sessionId': stripeSession.id, // 4. Get the ID of the session
            'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
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