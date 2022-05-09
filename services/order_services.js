const orderDataLayer = require('../dal/orders')

class OrderServices {
    constructor(user_id){
        this.user_id = user_id;
    }
     //get order by id
    async getOrderById(orderId){
        return await orderDataLayer.getOrderById(orderId);
    }

    //get order by user id
    async getUserOrder(){
        return await orderDataLayer.getUserOrder(this.user_id);
    }
    //get all order
    async getAllUserOrder(){
        return await orderDataLayer.getAllUserOrder();
    }

    //add order
    async addOrder(){
        return await orderDataLayer.addOrder();
    }

    //update order
    async updateOrder(){
        return await orderDataLayer.updateOrder();
    }

    //delete order 
    async deleteOrder(orderId){
        return await orderDataLayer.deleteOrder(orderId);
    }
    //there will be no return 
    async saveOrder(orderObj){
        await orderDataLayer.saveOrder(orderObj);
    }

   

}

module.exports = OrderServices