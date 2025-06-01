const{check}=require('express-validator');
exports.registervalidator=[
    check('name','name is required').not().isEmpty(),
    check('email',' please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),
    check('mobile','mobile no.should be 10 digits').isLength({
        min:10,
        max:10
    }),
    check('password','password must be  greater than 6, and contains at least one uppercase letter, one lowercase letter, and one number, and one special character ').isStrongPassword({
        minLength:6,
        minUppercase:0,minLowercase:1,
        minNumbers:1,
        minSymbols:1
    }),
]
exports.sendmailvarification=[
     check('email',' please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),
]
exports.passwordReset=[
    check('email','please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    })
]
