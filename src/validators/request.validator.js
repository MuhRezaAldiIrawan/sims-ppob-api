const { body } = require('express-validator');

// Registration validation
exports.registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Parameter email tidak sesuai format'),
    body('first_name')
        .notEmpty()
        .withMessage('Parameter first_name harus diisi'),
    body('last_name')
        .notEmpty()
        .withMessage('Parameter last_name harus diisi'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password minimal 8 karakter')
];

// Login validation
exports.loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Parameter email tidak sesuai format'),
    body('password')
        .notEmpty()
        .withMessage('Parameter password harus diisi')
];

// Update profile validation
exports.updateProfileValidation = [
    body('first_name')
        .notEmpty()
        .withMessage('Parameter first_name harus diisi'),
    body('last_name')
        .notEmpty()
        .withMessage('Parameter last_name harus diisi')
];

// Top up validation
exports.topUpValidation = [
    body('top_up_amount')
        .isNumeric()
        .withMessage('Parameter amount hanya boleh angka')
        .custom((value) => {
            if (value <= 0) {
                throw new Error('Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0');
            }
            return true;
        })
];

// Transaction validation
exports.transactionValidation = [
    body('service_code')
        .notEmpty()
        .withMessage('Parameter service_code harus diisi')
];