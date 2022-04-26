const express = require("express");
const router = express.Router();

//#1 import in the Product model
const { Product, RoastType } = require('../models')

//import in the Forms
const { bootstrapField, createProductForm } = require('../forms');
// const async = require("hbs/lib/async");

async function getProductById(productId) {
    const product = await Product.where({
        'id': productId
    }).fetch({
        'require': true
    })
    return product;
}

async function getAllRoastType(){
    const allRoastType = await RoastType.fetchAll().map( roastType => {
        return [ roastType.get('id'), roastType.get('name')]
    });
    return allRoastType;
}
//retrieve roast_type table info with roastType, 
//function in the model
router.get('/', async (req, res) => {
    // #2 - fetch all the products (ie, SELECT * from products)
    try {
        let products = await Product.collection().fetch({
            withRelated:['roastType']
        });
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
        const allRoastType = await getAllRoastType();
        const productForm = createProductForm(allRoastType);
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
        const allRoastType = await getAllRoastType();
        const productForm = createProductForm(allRoastType);
     
        productForm.handle(req, {
            'success': async (form) => {
                const product = new Product();
                product.set('product_name', form.data.product_name);
                product.set('price', form.data.price);
                product.set('qty', form.data.qty);
                product.set('description', form.data.description);
                product.set('roast_type_id', form.data.roast_type_id);
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

//update product
router.get('/:id/update', async (req, res) => {
    try {
        //retrieve product
        const product = await getProductById(req.params.id);
        const allRoastType = await getAllRoastType();
        //create the product form
        const form = createProductForm(allRoastType);

        form.fields.product_name.value = product.get('product_name');
        form.fields.price.value = product.get('price');
        form.fields.qty.value = product.get('qty');
        form.fields.description.value = product.get('description');
        form.fields.roast_type_id.value = product.get('roast_type_id');

        res.render('products/update', {
            'form': form.toHTML(bootstrapField),
            'products': product.toJSON()
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
        const product = await getProductById(req.params.id);
        const allRoastType = await getAllRoastType();
        const form = createProductForm(allRoastType);
        form.handle(req, {
            'success': async (form) => {
                product.set(form.data);
                product.save();
                res.redirect('/products')
            },
            'error': async (form) => {
                res.render('products/update', {
                    'form': form.toHTML(bootstrapField),
                    'products': product.toJSON()
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
    //fetch the product that we want to delete
    try {
        const product = await getProductById(req.params.id);

        res.render('products/delete', {
            'products': product.toJSON()
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.post('/:id/delete', async (req, res) => {
    try{
        const product = await getProductById(req.params.id);
        await product.destroy();
        res.redirect('/products');
    }catch(e){
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

module.exports = router;

