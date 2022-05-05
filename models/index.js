const bookshelf = require('../bookshelf')


//this model belongs to product
//after you added the model, need to go to route folder to display the product 
const Product = bookshelf.model('Product', {
    tableName: 'products',
    roastType(){
        return this.belongsTo('RoastType');    // one product has 1 roast type
    },
    certificates(){
        return this.belongsToMany('Certificate'); // 1 product havae many cert
    },
    origins(){
        return this.belongsToMany('Origin');
    },
    orders(){
        return this.hasMany('Order');
    }
});

const RoastType = bookshelf.model('RoastType', {
    tableName: 'roast_type',
    products(){
        return this.hasMany('Product'); // 1 roast type can have many product
    }
})

const Certificate = bookshelf.model('Certificate',{
    tableName: 'certificates',
    products() {
        return this.belongsToMany('Product') // 1 cert have many product 
    }
})

const User = bookshelf.model('User', {
    tableName: 'users',
    orders(){
        return this.hasMany('Order');
    }
})

const Origin = bookshelf.model('Origin', {
    tableName: 'origins',
    products(){
        return this.belongsToMany('Product')
    }
})

const CartItem = bookshelf.model('CartItem', {
    tableName: 'cart_items',
    product() {
         return this.belongsTo('Product')
    }
})

const Order = bookshelf.model('Order', {
    tableName: 'order',
    product(){
        return this.belongsTo('Product')
    },
    user(){
        return this.belongsTo('User')
    }

})

module.exports = { Product, RoastType, Certificate, User, Origin, CartItem, Order};