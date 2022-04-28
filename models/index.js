const bookshelf = require('../bookshelf')


//this model belongs to product
//after you added the model, need to go to route folder to display the product 
const Product = bookshelf.model('Product', {
    tableName: 'products',
    roastType(){
        return this.belongsTo('RoastType');
    },
    certificates(){
        return this.belongsToMany('Certificate');
    },
    origins(){
        return this.belongsToMany('Origin');
    }
});

const RoastType = bookshelf.model('RoastType', {
    tableName: 'roast_type',
    products(){
        return this.hasMany('Product');
    }
})

const Certificate = bookshelf.model('Certificate',{
    tableName: 'certificates',
    products() {
        return this.belongsToMany('Product')
    }
})

const User = bookshelf.model('User', {
    tableName: 'users'
})

const Origin = bookshelf.model('Origin', {
    tableName: 'origins',
    products(){
        return this.belongsToMany('Product')
    }
})

module.exports = { Product, RoastType, Certificate, User, Origin};