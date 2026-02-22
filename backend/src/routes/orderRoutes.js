const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth(['customer']), orderController.createOrder);
router.get('/', auth(['customer', 'seller', 'admin']), orderController.getOrders);
router.get('/:id', auth(['customer', 'seller', 'admin']), orderController.getOrderById);
router.put('/:id/status', auth(['seller', 'admin']), orderController.updateOrderStatus);
router.post('/:id/cancel-request', auth(['customer']), orderController.requestCancellation);
router.post('/:id/payment-proof', auth(['customer']), orderController.submitPaymentProof);
router.put('/:id/verify-payment', auth(['seller', 'admin']), orderController.verifyPayment);
router.post('/:id/review', auth(['customer']), orderController.submitReview);
router.post('/:id/complete', auth(['customer']), orderController.completeOrder);
router.post('/:id/return-request', auth(['customer']), orderController.submitReturnRequest);

module.exports = router;

