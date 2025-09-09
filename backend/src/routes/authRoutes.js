const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateUserRegistration } = require('../middlewares/validationMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, validateUserRegistration, authController.registerUser);
router.post('/login', authLimiter, authController.loginUser);
router.post('/register-owner', authLimiter, authController.registerStoreOwner);

module.exports = router;
