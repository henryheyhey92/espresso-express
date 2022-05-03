const { Product, RoastType, Certificate, Origin } = require('../models')

const getAllProducts = async () => {
    return await Product.fetchAll();
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


module.exports = {
    getProductById, getAllCerts, getAllRoastType, getAllOrigin, getAllProducts
}
