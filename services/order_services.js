const orderDataLayer = require('../dal/orders')

class OrderServices {
    constructor(user_id){
        this.user_id = user_id;
    }

    async getUserOrder(){
        return await orderDataLayer.getUserOrder(this.user_id);
    }

    async getAllUserOrder(){
        return await orderDataLayer.getAllUserOrder();
    }
}

module.exports = OrderServices