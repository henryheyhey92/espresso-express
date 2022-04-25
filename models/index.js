const bookshelf = require('../bookshelf')


//this model belongs to product
//after you added the model, need to go to route folder to display the product 
const Product = bookshelf.model('Product', {
    tableName: 'products'
});

module.exports = { Product };