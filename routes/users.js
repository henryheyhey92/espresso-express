const express = require("express");
const router = express.Router();

const {User} = require('../models');
const { createUserRegistration, bootstrapField } = require('../forms');


router.get('/', async (req, res) => {
    try {
        let users = await User.collection().fetch();
        res.render('users/index', {
            'users': users.toJSON()
        })
    }catch(e){
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.get('/register', async (req,res)=>{
    // display the registration form
    const registerForm = createUserRegistration();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', async (req, res) => {
    const registerForm = createUserRegistration();
    registerForm.handle(req, {
        'success': async (form) => {
            const user = new User({
                'first_name': form.data.first_name,
                'last_name': form.data.last_name,
                'address': form.data.address,
                'country': form.data.country,
                'email': form.data.email,
                'phone': form.data.phone,
                'password': form.data.password,
                'confirm_password': form.data.confirm_password,
                'user_type': form.data.user_type
            });
            await user.save();
            // req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})



router.get('/login', (req,res)=>{
    res.render('users/login')
})

module.exports = router;