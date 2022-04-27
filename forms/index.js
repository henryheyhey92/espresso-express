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
};


const createProductForm = (roast_type, certificates) => {
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
        'price': fields.number({
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
            'label':'Roast Type',
            'required': true,
            'errorAfterField': true,
            'widget':widgets.select(), // use the dropdowns elect
            'choices':roast_type
        }),
        'certificates': fields.string({
            'label': 'Certificate',
            'required': true,
            'errorAfterField': true,
            'widget': widgets.multipleSelect(),
            'choices': certificates
        })
     
    })
}

const createUserRegistration = () => {
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
        }),
        'user_type': fields.string({
            'required': validators.required("Please input user type"),
            'errorAfterField': true,
            'validators': [validators.maxlength(1)]
        })

    })
}

module.exports = {
    bootstrapField,
    createProductForm,
    createUserRegistration
}