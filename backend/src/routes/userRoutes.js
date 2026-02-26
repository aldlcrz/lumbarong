const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/profile', auth(), userController.getProfile);
router.put('/profile', auth(), userController.updateProfile);

router.get('/addresses', auth(), userController.getAddresses);
router.post('/addresses', auth(), userController.createAddress);
router.put('/addresses/:id', auth(), userController.updateAddress);
router.delete('/addresses/:id', auth(), userController.deleteAddress);
router.patch('/addresses/:id/default', auth(), userController.setDefaultAddress);

module.exports = router;
