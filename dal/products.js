const { Product, RoastType, Certificate, Origin } = require('../models')
const {knex} = require("../bookshelf");

const getAllProducts = async () => {
    return await Product.fetchAll();
}


async function getProductById(productId) {
    console.log("enter data layer get Product by id");
    console.log(productId);
    const product = await Product.where({
        'id': productId
    }).fetch({
        'require': true,
        'withRelated': ['certificates', 'roastType', 'origins']
    })
    console.log("get by id product");
    console.log(product);
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

async function getAllProductsName(){
    const allProducts = await Product.fetchAll().map(product => {
        return [product.get('id'), product.get('product_name')]
    })
    return allProducts;
}

async function getProductQuantity(productId){
    const quantity = await knex.select('qty').from('products').where({id : productId});
    return quantity;
}

async function updateProductQuantity(productId, updateQty){
    let num = parseInt(updateQty);
    const upDatedQuantity = await knex('products').where('id','=', productId).update({qty: num});
    return upDatedQuantity;
}

module.exports = {
    getProductById, 
    getAllCerts, 
    getAllRoastType, 
    getAllOrigin, 
    getAllProducts, 
    getAllProductsName,
    getProductQuantity,
    updateProductQuantity
}
