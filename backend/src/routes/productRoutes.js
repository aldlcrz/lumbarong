const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', auth(['seller', 'admin']), productController.createProduct);
router.put('/:id', auth(['seller', 'admin']), productController.updateProduct);
router.patch('/:id/stock', auth(['seller', 'admin']), productController.updateStock);
router.delete('/:id', auth(['seller', 'admin']), productController.deleteProduct);
router.post('/:id/rate', auth(['customer']), productController.rateProduct);

module.exports = router;
