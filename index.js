const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);
const csrf = require('csurf');


//some notes
//for session implementation, the session is use in the backend side of thing in this project
// the JWT ius use in the front end 

//create an instance of express app
let app = express();

//set the view engine
app.set("view engine", "hbs");


//make sure to enable cors before sessions
app.use(cors());

//static folder
app.use(express.static("public"));

//setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

//enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

// set up sessions
app.use(session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET_KEY,  //this one will need to change to secret key
    resave: false,
    saveUninitialized: true
}))

app.use(flash())

// Register Flash middleware
app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
});

// Share the user data with hbs files
app.use(function(req,res,next){
    res.locals.user = req.session.user;
    next();
});

// app.use(csrf());
const csurfInstance = csrf();  // creating a prox of the middleware
app.use(function(req,res,next){
    // if it is webhook url, then call next() immediately
    // or if the url is for the api, then also exclude from csrf
    if (req.url === '/checkout/process_payment' || 
        req.url.slice(0,5)=='/api/') {
        next();
    } else {
        csurfInstance(req,res,next);
    }


})

// middle to handle csrf errors
// if a middleware function takes 4 arguments
// the first argument is error
app.use(function (err, req, res, next) {
    if (err && err.code == "EBADCSRFTOKEN") {
        req.flash('error_messages', 'The form has expired. Please try again');
        res.redirect('back');
    } else {
        next()
    }
});

// Share CSRF with hbs files
app.use(function(req,res,next){
    //the req.csrfToken generate a new token 
    // and save its to the current session
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    }

    next();
})

//const for import new routes
// const landingRoutes = require('./routes/landing');
const productsRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary.js');
const shoppingCartRoutes = require('./routes/shoppingCart');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders')
const api = {
    products: require('./routes/api/products'),
    shoppingCart: require('./routes/api/shoppingCart'),
    checkout: require('./routes/api/checkout'),
    users: require('./routes/api/users'),
    orders: require('./routes/api/orders')
}

const { checkIfAuthenticated, checkIfUserOwnerAuthenticated, checkIfManagerOwnerAuthenticated } = require('./middlewares');


async function main() {
    // landing routes 
    // app.use('/landing', landingRoutes);
    app.use('/products', productsRoutes);  //only shop owner and manager, some user can access
    app.use('/',userRoutes); // for all
    app.use('/cloudinary', cloudinaryRoutes); 
    app.use('/cart', checkIfUserOwnerAuthenticated, shoppingCartRoutes); // only for user and shop owner
    app.use('/checkout', checkoutRoutes); // only for user and shop owner
    app.use('/api/products', express.json(), api.products); 
    app.use('/api/shoppingCart', express.json(), api.shoppingCart);
    app.use('/api/checkout', api.checkout);
    app.use('/api/users/', express.json(), api.users);
    app.use('/api/orders/', express.json(), api.orders);
    app.use('/orders', checkIfManagerOwnerAuthenticated, orderRoutes);
    //here need to write route for shopping cart and checkout
}

main();

//need to change when deploy to heroku
// app.listen(3002, () => {
//     console.log("Server has started");
// })

app.listen(process.env.PORT || 3000, () => {
    console.log("Server has started");
})