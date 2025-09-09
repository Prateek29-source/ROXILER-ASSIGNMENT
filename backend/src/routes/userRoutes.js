const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { validateUserCreationByAdmin, validatePasswordUpdate } = require('../middlewares/validationMiddleware');
const { apiLimiter } = require('../middlewares/rateLimiter');

// Apply general rate limiting to all routes
router.use(apiLimiter);

// --- Admin Routes ---
router.post('/', protect, isAdmin, validateUserCreationByAdmin, userController.createUserByAdmin);
router.get('/', protect, isAdmin, userController.getAllUsersByAdmin);
router.get('/:id', protect, isAdmin, userController.getUserByIdByAdmin);

// --- User Routes ---
router.put('/update-password', protect, validatePasswordUpdate, userController.updateUserPassword);

module.exports = router;
