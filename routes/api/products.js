const express = require('express')
const router = express.Router();

const productDataLayer = require('../../dal/products');
const ProductServices = require('../../services/product_services');
const { Product, RoastType, Certificate, Origin } = require('../../models');
const { bootstrapField, createProductForm, createSearchForm } = require('../../forms');


router.get('/', async (req, res) => {
    try {
        res.send(await productDataLayer.getAllProducts())
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.post('/search/text', async (req, res) => {
    try {
        let keyword = req.body.keyword;
        let product = new ProductServices();
        if (keyword === "" || keyword.length < 0) {
            res.send(await product.getAllProducts())
        } else {
            let response = await product.getProductByText(keyword);
            if (response) {
                res.send(response)
            } else {
                res.status(400);
                res.json({
                    'message': "Bad request (get product by keyword api)"
                })
            }
        }

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (get product by keyword api)"
        })
        console.log(e);
    }
})

router.post('/filter/by', async (req, res) => {
    // let {product_text, roast_type, min_price, max_price, certificates, origins} = req.body;
    try {
        console.log("requestBody");
        console.log(req.body);
        let product = new ProductServices();
        let response = await product.getSearchByAllField(req.body);
        if (response) {
            res.send(response)
        }
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (get product by search filter api)"
        })
        console.log(e);
    }

})


router.get('/getId/:id', async (req, res) => {
    try {
        console.log("enter get item by id 123");
        let product = new ProductServices();
        let response = await product.getProductById(req.params.id);
        console.log("get by id response");
        if (response) {
            res.send(response)
        }
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (get product by id api)"
        })
        console.log(e);
    }
})

router.get('/get/all/roast/type', async (req, res) => {
    try {
        let product = new ProductServices();
        let response = await product.getRoastType();
        console.log("Roast type response");
        res.send(response);
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (get product by id api)"
        })
        console.log(e);
    }

})

router.get('/get/cert/type', async (req, res) => {
    try {
        let product = new ProductServices();
        let response = await product.getCertType();
        res.send(response);
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (get product by id api)"
        })
        console.log(e);
    }
})

router.get('/get/country/origin', async (req, res) => {
    try {
        let product = new ProductServices();
        let response = await product.getCountryOrigin();
        res.send(response);
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator (get product by id api)"
        })
        console.log(e);
    }
})


// router.post('/', async (req, res) => {
//     try {
//         const allRoastType = await productDataLayer.getAllRoastType();

//         const allCerts = await productDataLayer.getAllCerts();

//         const allOrigin = await productDataLayer.getAllOrigin();

//         const productForm = createProductForm(allRoastType, allCerts, allOrigin);

//         productForm.handle(req, {
//             'success': async (form) => {
//                 let { origins, certificates, ...productData } = form.data;

//                 const product = new Product(productData);
//                 await product.save();

//                 if (origins) {
//                     await product.origins().attach(origins.split(","));
//                 }

//                 if (certificates) {
//                     await product.certificates().attach(certificates.split(","));
//                 }
//                 res.send(product.toJSON());

//             },
//             'error': async (form) => {
//                 // manually extact out the errors from the caolan
//                 // form and send it back as JSON
//                 let errors = {};
//                 for (let key in form.fields) {
//                     // check if that particular field has error
//                     if (form.fields[key].error) {
//                         errors[key] = form.fields[key].error;
//                     }
//                 }
//                 res.status(400);
//                 res.send(errors);
//             }
//         })
//     } catch (e) {
//         res.status(500);
//         res.json({
//             'message': "Internal server error. Please contact administrator"
//         })
//         console.log(e);
//     }
// })

module.exports = router;