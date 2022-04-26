const bookshelf = require('../bookshelf')


//this model belongs to product
//after you added the model, need to go to route folder to display the product 
const Product = bookshelf.model('Product', {
    tableName: 'products',
    roastType(){
        return this.belongsTo('RoastType');
    } 
});

const RoastType = bookshelf.model('RoastType', {
    tableName: 'roast_type',
    products(){
        return this.hasMany('Product');
    }
})

module.exports = { Product, RoastType};