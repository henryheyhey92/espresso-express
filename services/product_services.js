const productDataLayer = require('../dal/products');

class ProductServices {
    constructor(product_id){
        this.product_id = product_id;
    }

    async getProductById(product_id){
        return await productDataLayer.getProductById(product_id);
    }

    // async getProductByName(product_name){
    //     return await productDataLayer.getProductByName(product_name);
    // }
}

module.exports = ProductServices