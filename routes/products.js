const express = require("express");
const router = express.Router();

//#1 import in the Product model
const { Product } = require('../models')

router.get('/', async (req, res) => {
    // #2 - fetch all the products (ie, SELECT * from products)
    try {
        let products = await Product.collection().fetch();
        res.render('products/index', {
            'products': products.toJSON() //#3 convert collection to JSON
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

