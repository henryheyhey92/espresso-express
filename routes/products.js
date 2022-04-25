const express = require("express");
const router = express.Router();

//#1 import in the Product model
const { Product } = require('../models')

//import in the Forms
const { bootstrapField, createProductForm } = require('../forms');

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

router.get('/create', async (req, res) => {
    try {
        const productForm = createProductForm();
        res.render('products/create', {
            'form': productForm.toHTML(bootstrapField)
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.post('/create', async (req, res) => {
    try {
        const productForm = createProductForm();
        productForm.handle(req, {
            'success': async (form) => {
                const product = new Product();
                product.set('product_name', form.data.product_name);
                product.set('price', form.data.price);
                product.set('qty', form.data.qty);
                product.set('description', form.data.description);
                await product.save();
                res.redirect('/products');
            },
            'error': async (form) => {
                res.render('products/create', {
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

module.exports = router;

