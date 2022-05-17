//import in caolan forms

const forms = require('forms')
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;


var bootstrapField = function (name, object) {

    if (!Array.isArray(object.widget.classes)) {
        object.widget.classes = [];
    }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';

    // console.log("bootstrap field");
    // console.log(name);
    // return (name === 'origins')?  '<div class="form-check form-check-inline">' + label + widget + error + '</div>' : '<div class="form-group">' + label + widget + error + '</div>';
};


const createProductForm = (roast_type, certificates, origins) => {
    // first arg of forms.create takes in the config value
    // the key is the NAME of the <input type=...>
    // the value defines the properties of input
    return forms.create({
        // <input type="text" name="name"/>
        'product_name': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.maxlength(100)]
        }),
        // <input type="text" name="cost"/>
        'price': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.integer(), validators.min(0)]
        }),
        // <input type='text' name='qty'/>
        'qty': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.integer(), validators.min(0)]
        }),
        // <input type="text" name="description"/>
        'description': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.maxlength(1000)]
        }),
        'roast_type_id': fields.string({
            'label': 'Roast Type',
            'required': true,
            'errorAfterField': true,
            'widget': widgets.select(), // use the dropdowns elect
            'choices': roast_type
        }),
        'certificates': fields.string({
            'label': 'Certificate',
            'required': true,
            'errorAfterField': true,
            'widget': widgets.multipleSelect(),
            'choices': certificates
        }),
        'origins': fields.string({
            'label': 'Origin',
            'required': true,
            'errorAfterField': true,
            'widget': widgets.multipleSelect(),
            'choices': origins
        }),
        'image_url':fields.string({
            'widget': widgets.hidden()
        })

    })
}

const createUserForm = () => {
    return forms.create({
        'first_name': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.maxlength(100)]
        }),
        'last_name': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.maxlength(100)]
        }),
        'address': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.maxlength(200)]
        }),
        'country': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.maxlength(50)]
        }),
        'email': fields.email({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.email()]
        }),
        'phone': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.integer(), validators.maxlength(20)]
        }),
        'password': fields.password({
            'required': validators.required("Please input at least 6 characters or more and have to be alphanumeric"),
            'errorAfterField': true,
            'validators': [validators.minlength(6), validators.alphanumeric()]
        }),
        'confirm_password': fields.password({
            'required': validators.required("don\'t you know your own password"),
            'errorAfterField': true,
            'validators': [validators.matchField('password')]
        })
        //,
        // 'user_type': fields.string({
        //     'required': validators.required("Please input user type"),
        //     'errorAfterField': true,
        //     'validators': [validators.maxlength(1)]
        // })

    })
}


const createLoginForm = () => {
    return forms.create({
        'email': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label mt-2']
            }
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label mt-4']
            }
        }),
    })

}

const createSearchForm = (roast_type, certificates, origins) => {
    return forms.create({
        // <input type="text" name="name"/>
        'product_name': fields.string({
            'required': false,
            'errorAfterField': true,
            'validators': [validators.maxlength(100)]
        }),
        // <input type="text" name="cost"/>
        'min_price': fields.string({
            'required': false,
            'errorAfterField': true,
            'validators': [validators.integer(), validators.min(0)]
        }),
        'max_price': fields.string({
            'required': false,
            'errorAfterField': true,
            'validators': [validators.integer(), validators.min(0)]
        }),
        'roast_type_id': fields.string({
            'label': 'Roast Type',
            'required': false,
            'errorAfterField': true,
            'widget': widgets.select(), // use the dropdowns elect
            'choices': roast_type
        }),
        'certificates': fields.string({
            'label': 'Certificate',
            'required': false,
            'errorAfterField': true,
            'widget': widgets.multipleSelect(),
            'choices': certificates
        }),
        'origins': fields.string({
            'label': 'Origin',
            'required': false,
            'errorAfterField': true,
            'widget': widgets.multipleSelect(),
            'choices': origins
        })
    })
}

const createOrderForm = (allProduct, allUser, allOrderStatus) => {
    return forms.create({
        'product_name': fields.string({
            'label': 'Product Name',
            'required': true,
            'errorAfterField': true,
            'widget': widgets.select(),
            'choices': allProduct
        }),
        'purchaser_name': fields.string({
            'label': 'Purchaser Name',
            'required': true,
            'errorAfterField': true,
            'widget': widgets.select(),
            'choices': allUser
        }),
        'shipping_address': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.maxlength(1000)]
        }),
        'quantity': fields.string({
            'required': true,
            'errorAfterField': true,
            'validators': [validators.integer(), validators.min(0)]
        }),
        'status_id': fields.string({
            'label':'Status',
            'required': true,
            'errorAfterField': true,
            'cssClasses': {
                label: ['form-label']
            },
            'widget': widgets.select(),
            'choices': allOrderStatus
        })

    })
}


const updateStatusForm = (allOrderStatus) => {
    return forms.create({
        'status_id': fields.string({
            'label':'Status',
            'required': true,
            'errorAfterField': true,
            'cssClasses': {
                label: ['form-label']
            },
            'widget': widgets.select(),
            'choices': allOrderStatus
        })
    })
}

const createSearchOrderForm = (allProduct, allUser, allOrderStatus) => {
    return forms.create({
        // <input type="text" name="name"/>
        'product_name': fields.string({
            'required': false,
            'errorAfterField': true,
            'validators': [validators.maxlength(100)]
        }),
        // <input type="text" name="cost"/>
        'purchaser_name': fields.string({
            'label': 'Purchase Name',
            'required': false,
            'errorAfterField': true,
            'widget': widgets.select(),
            'choices': allUser
        }),
        'status_id': fields.string({
            'label':'Status',
            'required': true,
            'errorAfterField': true,
            'cssClasses': {
                label: ['form-label']
            },
            'widget': widgets.select(),
            'choices': allOrderStatus
        })
    })
}

module.exports = {
    bootstrapField,
    createProductForm,
    createUserForm,
    createLoginForm,
    createSearchForm,
    createOrderForm,
    updateStatusForm,
    createSearchOrderForm
}