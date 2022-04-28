const express = require("express");
const router = express.Router();

const { User, Product } = require('../models');
const { createUserForm, bootstrapField } = require('../forms');

async function getUserById(userId) {
    const user = await User.where({
        'id': userId
    }).fetch({
        'require': true
    })
    return user;
}

router.get('/', async (req, res) => {
    try {
        let users = await User.collection().fetch();
        res.render('users/index', {
            'users': users.toJSON()
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.get('/register', async (req, res) => {
    // display the registration form
    const registerForm = createUserForm();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', async (req, res) => {
    const registerForm = createUserForm();
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

router.get('/:id/update', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);

        const form = createUserForm();

        form.fields.first_name.value = user.get('first_name');
        form.fields.last_name.value = user.get('last_name');
        form.fields.address.value = user.get('address');
        form.fields.country.value = user.get('country');
        form.fields.email.value = user.get('email');
        form.fields.phone.value = user.get('phone');
        form.fields.password.value = user.get('password');
        form.fields.confirm_password.value = user.get('confirm_password');
        form.fields.user_type.value = user.get('user_type');

        res.render('users/update', {
            'form': form.toHTML(bootstrapField),
            'users': user.toJSON()
        })

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})


router.post('/:id/update', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        const form = createUserForm();

        form.handle(req, {
            'success': async (form) => {
                user.set(form.data);
                user.save();
                res.redirect('/users');
            },
            'error': async (form) => {
                res.render('users/update', {
                    'form': form.toHTML(bootstrapField),
                    'users': user.toJSON()
                })
            }
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.get('/:id/delete', async (req, res) => {
    try{
        const user = await getUserById(req.params.id);

        res.render('users/delete', {
            'users': user.toJSON()
        })
    }catch (e){
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.post('/:id/delete', async (req, res) => {
    try{
        const user = await getUserById(req.params.id);
        await user.destroy();
        res.redirect('/users');
    }catch (e){
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})



router.get('/login', (req, res) => {
    res.render('users/login')
})

module.exports = router;