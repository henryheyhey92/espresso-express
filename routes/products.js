const express = require("express");
const router = express.Router();

//#1 import in the Product model
const { Product, RoastType, Certificate, Origin } = require('../models');
const dataLayer = require('../dal/products');

//import in the Forms
const { bootstrapField, createProductForm, createSearchForm } = require('../forms');
const { checkIfAuthenticated, checkIfManagerOwnerAuthenticated, checkIfUserOwnerAuthenticated, checkIfAllAuthenticated } = require('../middlewares');
const async = require("hbs/lib/async");
// const async = require("hbs/lib/async");

//retrieve roast_type table info with roastType, 
//function in the model
router.get('/', checkIfAllAuthenticated, async (req, res) => {
    // #2 - fetch all the products (ie, SELECT * from products)
    try {
        const allRoastType = await dataLayer.getAllRoastType();
        allRoastType.unshift(["", "All"]);

        const allCerts = await dataLayer.getAllCerts();

        const allOrigin = await dataLayer.getAllOrigin();

        let searchForm = createSearchForm(allRoastType, allCerts, allOrigin);
        let q = Product.collection();

        searchForm.handle(req, {
            'empty': async (form) => {
                let products = await q.fetch({
                    withRelated: ['certificates', 'roastType', 'origins']
                })
                res.render('products/index', {
                    'products': products.toJSON(),
                    'form': form.toHTML(bootstrapField)
                })

            },
            'error': async (form) => {
                let products = await q.fetch({
                    withRelated: ['certificates', 'roastType', 'origins']
                })
                res.render('products/index', {
                    'products': products.toJSON(),
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
                if (form.data.roast_type_id) {
                    q = q.where('roast_type_id', '=', form.data.roast_type_id)
                }
                
                if (form.data.min_price) {
                    q = q.where('price', '>=', form.data.min_price)
                }

                if (form.data.max_price) {
                    q = q.where('price', '<=', form.data.max_price);
                }

                if (form.data.certificates) {
                    // joining in bookshelf
                    q.query('join', 'certificates_products', 'products.id', 'product_id')
                        .where('certificate_id', 'in', form.data.certificates.split(','))
                    // is eqv:
                    // select * from products JOIN products_tags ON products.id 
                }

                if (form.data.origins) {
                    // joining in bookshelf
                    q.query('join', 'origins_products', 'products.id', 'product_id')
                        .where('origin_id', 'in', form.data.origins.split(','))
                    // is eqv:
                    // select * from products JOIN products_tags ON products.id 
                }


                let products = await q.fetch({
                    withRelated: ['certificates', 'roastType', 'origins']
                })
                // console.log(req.session.user);
                // let userType = null
                // if(req.session.user.user_type !== 'U'){
                //     userType = true
                //     console.log('enter');
                // }else{
                //     userType = false;
                // }
                res.render('products/index', {
                    'products': products.toJSON(),
                    'form': form.toHTML(bootstrapField)
                    // 'usersType': userType.toJSON()
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

router.get('/create', checkIfManagerOwnerAuthenticated, async (req, res) => {
    try {
        const allRoastType = await dataLayer.getAllRoastType();
        const allCerts = await dataLayer.getAllCerts();
        const allOrigin = await dataLayer.getAllOrigin();
        //above instance will pass information to the Product Form
        const productForm = createProductForm(allRoastType, allCerts, allOrigin);
        res.render('products/create', {
            'form': productForm.toHTML(bootstrapField),
            cloudinaryName: process.env.CLOUDINARY_NAME,
            cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
            cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }

})

router.post('/create', checkIfManagerOwnerAuthenticated, async (req, res) => {
    try {
        const allRoastType = await dataLayer.getAllRoastType();
        const allCerts = await dataLayer.getAllCerts();
        const allOrigin = await dataLayer.getAllOrigin();
        const productForm = createProductForm(allRoastType, allCerts, allOrigin);

        productForm.handle(req, {
            'success': async (form) => {
                const product = new Product();
                product.set('product_name', form.data.product_name);
                product.set('price', form.data.price);
                product.set('qty', form.data.qty);
                product.set('description', form.data.description);
                product.set('roast_type_id', form.data.roast_type_id);
                product.set('image_url', form.data.image_url);
                await product.save();

                let certs = form.data.certificates; //table name
                let ori = form.data.origins;
                if (certs) {
                    // the reason we split the tags by comma
                    // is because attach function takes in an array of ids

                    // add new tags to the M:n tags relationship
                    await product.certificates().attach(certs.split(',')); //don understand this part
                }
                if (ori) {
                    await product.origins().attach(ori.split(','));
                }
                req.flash("success_messages", `New Product ${product.get('product_name')} has been created`)

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
router.get('/:id/update', checkIfManagerOwnerAuthenticated, async (req, res) => {
    try {
        //retrieve product
        const product = await dataLayer.getProductById(req.params.id);
        const allRoastType = await dataLayer.getAllRoastType();
        const allCerts = await dataLayer.getAllCerts();
        const allOrigin = await dataLayer.getAllOrigin();
        //create the product form
        const form = createProductForm(allRoastType, allCerts, allOrigin);

        form.fields.product_name.value = product.get('product_name');
        form.fields.price.value = product.get('price');
        form.fields.qty.value = product.get('qty');
        form.fields.description.value = product.get('description');
        form.fields.roast_type_id.value = product.get('roast_type_id');
        form.fields.image_url.value = product.get('image_url'); //for upload image

        let selectCerts = await product.related('certificates').pluck('id');
        form.fields.certificates.value = selectCerts;

        let selectOri = await product.related('origins').pluck('id');
        form.fields.origins.value = selectOri;

        res.render('products/update', {
            'form': form.toHTML(bootstrapField),
            'products': product.toJSON(),
            // 2 - send to the HBS file the cloudinary information
            cloudinaryName: process.env.CLOUDINARY_NAME,
            cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
            cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})


router.post('/:id/update', checkIfManagerOwnerAuthenticated ,async (req, res) => {
    try {
        const product = await dataLayer.getProductById(req.params.id);
        const allRoastType = await dataLayer.getAllRoastType();
        const form = createProductForm(allRoastType);
        form.handle(req, {
            'success': async (form) => {
                let { origins, certificates, ...productData } = form.data;

                product.set(productData);
                product.save();

                let selectedCert = certificates.split(',');
                let selectedOri = origins.split(',');

                // get all the existing tags 
                let existingCert = await product.related('certificates').pluck('id');
                let existingOri = await product.related('origins').pluck('id');

                // remove all the tags that are not selected anymore
                let toRemoveCert = existingCert.filter(id => selectedCert.includes(id) === false);
                let toRemoveOri = existingOri.filter(id => selectedOri.includes(id) === false);

                await product.certificates().detach(toRemoveCert);
                await product.origins().detach(toRemoveOri);
                // detach will take in an array of ids
                // those ids will be removed from the relationship


                // add in all the new tags
                await product.certificates().attach(selectedCert);
                await product.origins().attach(selectedOri);

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


router.get('/:id/delete', checkIfManagerOwnerAuthenticated, async (req, res) => {
    //fetch the product that we want to delete
    try {
        const product = await dataLayer.getProductById(req.params.id);

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

router.post('/:id/delete', checkIfManagerOwnerAuthenticated, async (req, res) => {
    try {
        const product = await dataLayer.getProductById(req.params.id);
        await product.destroy();
        res.redirect('/products');
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

module.exports = router;

