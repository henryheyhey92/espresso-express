const express = require("express");
const router = express.Router();

//#1 import in the Product model
const { Product, RoastType, Certificate, Origin} = require('../models')

//import in the Forms
const { bootstrapField, createProductForm } = require('../forms');
const { checkIfAuthenticated } = require('../middlewares');
const async = require("hbs/lib/async");
// const async = require("hbs/lib/async");

async function getProductById(productId) {
    const product = await Product.where({
        'id': productId
    }).fetch({
        'require': true,
        'withRelated': ['certificates', 'roastType', 'origins']
    })
    return product;
}

async function getAllRoastType() {
    const allRoastType = await RoastType.fetchAll().map(roastType => {
        return [roastType.get('id'), roastType.get('name')]
    });
    return allRoastType;
}

async function getAllCerts() {
    const allCerts = await Certificate.fetchAll().map(certificate => {
        return [certificate.get('id'), certificate.get('name')]
    });
    return allCerts;
}

async function getAllOrigin() {
    const allOrigin = await Origin.fetchAll().map(origin => {
        return [origin.get('id'), origin.get('country_name')]
    })
    return allOrigin;
}


//retrieve roast_type table info with roastType, 
//function in the model
router.get('/', async (req, res) => {
    // #2 - fetch all the products (ie, SELECT * from products)
    try {
        let products = await Product.collection().fetch({
            withRelated: ['certificates', 'roastType', 'origins']
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

router.get('/create', checkIfAuthenticated, async (req, res) => {
    try {
        const allRoastType = await getAllRoastType();
        const allCerts = await getAllCerts();
        const allOrigin = await getAllOrigin();
        //above instance will pass information to the Product Form
        const productForm = createProductForm(allRoastType, allCerts, allOrigin);
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

router.post('/create', checkIfAuthenticated, async (req, res) => {
    try {
        const allRoastType = await getAllRoastType();
        const allCerts = await getAllCerts();
        const allOrigin = await getAllOrigin();
        const productForm = createProductForm(allRoastType, allCerts, allOrigin);

        productForm.handle(req, {
            'success': async (form) => {
                const product = new Product();
                product.set('product_name', form.data.product_name);
                product.set('price', form.data.price);
                product.set('qty', form.data.qty);
                product.set('description', form.data.description);
                product.set('roast_type_id', form.data.roast_type_id);
                await product.save();

                let certs = form.data.certificates; //table name
                let ori = form.data.origins;
                if (certs) {
                    // the reason we split the tags by comma
                    // is because attach function takes in an array of ids

                    // add new tags to the M:n tags relationship
                    await product.certificates().attach(certs.split(',')); //don understand this part
                }
                if(ori){
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
router.get('/:id/update', async (req, res) => {
    try {
        //retrieve product
        const product = await getProductById(req.params.id);
        const allRoastType = await getAllRoastType();
        const allCerts = await getAllCerts();
        const allOrigin = await getAllOrigin();
        //create the product form
        const form = createProductForm(allRoastType, allCerts, allOrigin);

        form.fields.product_name.value = product.get('product_name');
        form.fields.price.value = product.get('price');
        form.fields.qty.value = product.get('qty');
        form.fields.description.value = product.get('description');
        form.fields.roast_type_id.value = product.get('roast_type_id');

        let selectCerts = await product.related('certificates').pluck('id');
        form.fields.certificates.value = selectCerts;

        let selectOri = await product.related('origins').pluck('id');
        form.fields.origins.value = selectOri;

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
                let { origins, certificates, ...productData } = form.data;

                product.set(productData);
                product.save();

                let selectedCert = certificates.split(',');
                let selectedOri = origins.split(',');

                // get all the existing tags 
                let existingCert = await product.related('certificates').pluck('id');
                let existingOri = await product.related('origins').pluck('id');

                // remove all the tags that are not selected anymore
                let toRemove = existingCert.filter(id => selectedCert.includes(id) === false);
                let toRemoveOri = existingOri.filter(id => selectedOri.includes(id) === false);

                await product.certificates().detach(toRemove); 
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
    try {
        const product = await getProductById(req.params.id);
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

