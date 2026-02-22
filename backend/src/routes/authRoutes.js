const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
], authController.register);

router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], authController.login);

router.get('/seller/:id', authController.getSellerProfile);

router.get('/stats', authController.getPlatformStats);

// Admin only routes
router.post('/create-seller', auth(['admin']), authController.createSeller);
router.get('/sellers', auth(['admin']), authController.getSellers);
router.put('/approve-seller/:id', auth(['admin']), authController.approveSeller);
router.put('/revoke-seller/:id', auth(['admin']), authController.revokeSeller);

module.exports = router;

