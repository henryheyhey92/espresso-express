const express = require('express')
const router = express.Router();

const productDataLayer = require('../../dal/products')
const { Product, RoastType, Certificate, Origin } = require('../../models');
const { bootstrapField, createProductForm, createSearchForm } = require('../../forms');


router.get('/', async (req, res) => {
    try{
        res.send(await productDataLayer.getAllProducts())
    }catch(e){
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})


router.post('/', async (req, res) => {
    try {
        const allRoastType = await productDataLayer.getAllRoastType();

        const allCerts = await productDataLayer.getAllCerts();

        const allOrigin = await productDataLayer.getAllOrigin();

        const productForm = createProductForm(allRoastType, allCerts, allOrigin);

        productForm.handle(req, {
            'success': async (form) => {
                let { origins, certificates, ...productData } = form.data;

                const product = new Product(productData);
                await product.save();

                if (origins) {
                    await product.origins().attach(origins.split(","));
                }

                if (certificates) {
                    await product.certificates().attach(certificates.split(","));
                }
                res.send(product.toJSON());

            },
            'error': async (form) => {
                // manually extact out the errors from the caolan
                // form and send it back as JSON
                let errors = {};
                for (let key in form.fields) {
                    // check if that particular field has error
                    if (form.fields[key].error) {
                        errors[key] = form.fields[key].error;
                    }
                }
                res.status(400);
                res.send(errors);
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