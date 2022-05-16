const cartDataLayer = require('../dal/cart_items')

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    async addToCart(productId, quantity) {
        // check if uuser has added the product to the shopping cart before
        let cartItem = await cartDataLayer.getCartItemByUserAndProduct(this.user_id, productId);

        if (cartItem) {
            return await cartDataLayer.updateQuantity(this.user_id, productId, cartItem.get('quantity') + 1);
        } else {
            let newCartItem = cartDataLayer.createCartItem(this.user_id, productId, quantity);
            return newCartItem;
        }
    }

    async substractToCart(productId){
        let cartItem = await cartDataLayer.getCartItemByUserAndProduct(this.user_id, productId);
        console.log("cart item");
        console.log(cartItem);
        if (cartItem.get('quantity') > 0) {
            return await cartDataLayer.updateQuantity(this.user_id, productId, cartItem.get('quantity') -1);
        }else{
            return false;
        }
    }

    async remove(productId) {
        return await cartDataLayer.removeFromCart(this.user_id, productId);
    }

    async removeAllFromCart(){
        return await cartDataLayer.removeAllFromCart(this.user_id);
    }

    async setQuantity(productId, quantity) {
        return await cartDataLayer.updateQuantity(this.user_id, productId, quantity);
    }

    async getCart() {
        return await cartDataLayer.getCart(this.user_id);
    }

    async getCurrProductCartQuantity(product_id){
        return await cartDataLayer.getCurrProductCartQuantity(product_id, this.user_id);
    }
}
module.exports = CartServices;