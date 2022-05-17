const productDataLayer = require('../dal/products');

class ProductServices {
    constructor(product_id){
        this.product_id = product_id;
    }

    async getProductById(product_id){
        return await productDataLayer.getProductById(product_id);
    }
    //get all product name for selection field
    async getProductName(){
        return await productDataLayer.getAllProductsName();
    }

    async getProductQuantity(){
        return await productDataLayer.getProductQuantity(this.product_id);
    }

    async updateProductQuantity(product_id, updateQty){
        return await productDataLayer.updateProductQuantity(product_id, updateQty);
    }

    async getProductByText(search_text){
        return await productDataLayer.getProductByText(search_text);
    }

    async getAllProducts(){
        return await productDataLayer.getAllProducts();
    }
}

module.exports = ProductServices