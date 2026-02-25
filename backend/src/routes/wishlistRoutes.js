const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth(['customer', 'seller', 'admin']), wishlistController.getWishlist);
router.post('/', auth(['customer']), wishlistController.addToWishlist);
router.delete('/:productId', auth(['customer']), wishlistController.removeFromWishlist);

module.exports = router;
