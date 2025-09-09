const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { apiLimiter, ratingLimiter } = require('../middlewares/rateLimiter');

// Apply general rate limiting to all routes
router.use(apiLimiter);

// --- Admin Routes ---
router.post('/', protect, isAdmin, storeController.createStoreByAdmin);
router.get('/dashboard-stats', protect, isAdmin, storeController.getDashboardStats);

// --- Store Owner Route ---
router.get('/my-store', protect, storeController.getStoreOwnerDashboard);

// --- Public/User Routes ---
router.get('/', protect, storeController.getAllStores);

// --- Rating Routes for a specific store ---
router.post('/:storeId/ratings', protect, ratingLimiter, storeController.submitOrUpdateRating);

module.exports = router;
