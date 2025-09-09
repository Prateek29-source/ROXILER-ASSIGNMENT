const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateUserRegistration = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 60 })
        .withMessage('Name must be between 3 and 60 characters.'),
    body('email')
        .isEmail()
        .withMessage('Please include a valid email.')
        .normalizeEmail(),
    body('address')
        .isLength({ max: 400 })
        .withMessage('Address cannot be more than 400 characters.'),
    body('password')
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters.')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$&*])/)
        .withMessage('Password must contain at least one uppercase letter and one special character.'),
    handleValidationErrors
];

const validateUserCreationByAdmin = [
    ...validateUserRegistration,
    body('role')
        .isIn(['ADMIN', 'USER', 'STORE_OWNER'])
        .withMessage('Invalid role specified.'),
    handleValidationErrors
];

const validatePasswordUpdate = [
    body('newPassword')
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters.')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$&*])/)
        .withMessage('Password must contain at least one uppercase letter and one special character.'),
    handleValidationErrors
];

module.exports = {
    validateUserRegistration,
    validateUserCreationByAdmin,
    validatePasswordUpdate,
};
