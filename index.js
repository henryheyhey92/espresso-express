const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

//create an instance of express app
let app = express();

//set the view engine
app.set("view engine", "hbs");

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
    secret: 'keyboard cat',  //this one will need to change to secret key
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

//const for import new routes
const landingRoutes = require('./routes/landing');
const productsRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

async function main() {
    // landing routes 
    app.use('/', landingRoutes);
    app.use('/products', productsRoutes);
    app.use('/users', userRoutes);
}

main();

app.listen(3000, () => {
    console.log("Server has started");
})