const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

router.get('/dashboard', auth(['admin']), adminController.getDashboard);
router.get('/users', auth(['admin']), adminController.getUsers);

router.delete('/products/:id', auth(['admin']), adminController.deleteProduct);

module.exports = router;

