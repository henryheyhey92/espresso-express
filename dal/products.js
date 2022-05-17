const { Product, RoastType, Certificate, Origin } = require('../models')
const { knex } = require("../bookshelf");

const getAllProducts = async () => {
    return await Product.fetchAll({
        'require': true,
        'withRelated': ['certificates', 'roastType', 'origins']
    });
}


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

async function getAllProductsName() {
    const allProducts = await Product.fetchAll().map(product => {
        return [product.get('id'), product.get('product_name')]
    })
    return allProducts;
}

async function getProductQuantity(productId) {
    const quantity = await knex.select('qty').from('products').where({ id: productId });
    return quantity;
}

async function updateProductQuantity(productId, updateQty) {
    let num = parseInt(updateQty);
    const upDatedQuantity = await knex('products').where('id', '=', productId).update({ qty: num });
    return upDatedQuantity;
}

async function getProductByText(searchText) {
    const searchResult = await knex('products').whereILike('product_name', '%' + searchText + '%');
    return searchResult;
}

async function searchAllField(reqObject) {
    try {
        let { product_text, roast_type, min_price, max_price, certificates, origins } = reqObject;
        let q = Product.collection();

        if (reqObject.length < 0) {
            return (await q.fetch({
                withRelated: ['certificates', 'roastType', 'origins']
            }))
        }

        if (product_text) {
            q = q.where('product_name', 'like', '%' + product_text + '%');
        }

        if (roast_type) {
            q = q.where('roast_type_id', '=', roast_type);
        }

        if (min_price) {
            q = q.where('price', '>=', min_price)
        }

        if (max_price) {
            q = q.where('price', '<=', max_price);
        }

        if (certificates) {
            // joining in bookshelf
            q.query('join', 'certificates_products', 'products.id', 'product_id')
                .where('certificate_id', 'in', certificates)
            // is eqv:
            // select * from products JOIN products_tags ON products.id 
        }

        if (origins) {
            // joining in bookshelf
            q.query('join', 'origins_products', 'products.id', 'product_id')
                .where('origin_id', 'in', origins)
        }


        let response = await q.fetch({
            withRelated: ['certificates', 'roastType', 'origins']
        })

        return response;

    } catch (e) {
        console.log(e);
    }

}


async function getAllRoastTypeV2() {
    const allRoastType = await RoastType.fetchAll()
    return allRoastType;
}

async function getAllCertsV2() {
    const allCerts = await Certificate.fetchAll()
    return allCerts;
}

async function getAllOriginV2() {
    const allOrigin = await Origin.fetchAll()
    return allOrigin;
}

module.exports = {
    getProductById,
    getAllCerts,
    getAllRoastType,
    getAllOrigin,
    getAllProducts,
    getAllProductsName,
    getProductQuantity,
    updateProductQuantity,
    getProductByText,
    searchAllField,
    getAllRoastTypeV2,
    getAllCertsV2,
    getAllOriginV2
}
