const User = require('../models/User');
const { Product, ProductRating } = require('../models/Product');
const { Order, OrderItem } = require('../models/Order');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, shopName, shopDescription, gcashNumber } = req.body;

        // Check if user exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userRole = role === 'seller' ? 'seller' : 'customer';
        const isVerified = userRole === 'customer'; // Customers auto-verified, sellers need admin approval

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
            shopName: userRole === 'seller' ? shopName : null,
            shopDescription: userRole === 'seller' ? shopDescription : null,
            gcashNumber: userRole === 'seller' ? gcashNumber : null,
            isVerified
        });

        // Create token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name,
                email,
                role: user.role,
                isVerified: user.isVerified,
                profileImage: user.profileImage
            },
            message: 'Registration successful.'
        });

        // Notify admin if a seller registers
        if (userRole === 'seller') {
            const { sendNotification } = require('../utils/notificationHelper');
            const admin = await User.findOne({ where: { role: 'admin' } });
            if (admin) {
                await sendNotification(admin.id, `New artisan registration: ${shopName || name}`, 'system');
            }
            if (req.app.get('io')) {
                req.app.get('io').emit('dashboard_update');
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createSeller = async (req, res) => {
    try {
        const { name, email, password, shopName, shopDescription } = req.body;

        let user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({ message: 'Email already registered' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const seller = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'seller',
            shopName,
            shopDescription,
            isVerified: true
        });

        res.status(201).json({ message: 'Seller created successfully', seller: { id: seller.id, name, email, shopName } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPlatformStats = async (req, res) => {
    try {
        const artisanCount = await User.count({ where: { role: 'seller', isVerified: true } });
        const productCount = await Product.count();

        // Calculate average platform rating
        const ratings = await ProductRating.findAll();
        let totalRating = 0;
        let totalReviews = ratings.length;

        ratings.forEach(r => {
            totalRating += r.rating;
        });

        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '4.9';

        res.json({
            artisanCount,
            productCount,
            averageRating
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getSellers = async (req, res) => {
    try {
        const { verified } = req.query;
        let where = { role: 'seller' };
        if (verified !== undefined) where.isVerified = verified === 'true';

        const sellers = await User.findAll({
            where,
            attributes: { exclude: ['password'] }
        });

        // Enhance with stats
        const enhancedSellers = await Promise.all(sellers.map(async (seller) => {
            const products = await Product.findAll({
                where: { sellerId: seller.id },
                include: [{ model: ProductRating, as: 'ratings' }]
            });

            let totalRating = 0;
            let totalReviews = 0;

            products.forEach(p => {
                p.ratings.forEach(r => {
                    totalRating += r.rating;
                    totalReviews++;
                });
            });

            const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

            return {
                ...seller.toJSON(),
                profileImage: seller.profileImage,
                productCount: products.length,
                averageRating,
                totalReviews
            };
        }));

        res.json(enhancedSellers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.approveSeller = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== 'seller') {
            return res.status(404).json({ message: 'Seller not found' });
        }

        user.isVerified = true;
        await user.save();

        if (req.app.get('io')) {
            req.app.get('io').emit('dashboard_update');
        }

        res.json({ message: 'Seller approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.revokeSeller = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== 'seller') {
            return res.status(404).json({ message: 'Seller not found' });
        }

        user.isVerified = false;
        await user.save();

        if (req.app.get('io')) {
            req.app.get('io').emit('dashboard_update');
        }

        res.json({ message: 'Seller verification revoked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCustomerProfile = async (req, res) => {
    try {
        const sellerId = req.user.id || req.user.userId;
        const customerId = req.params.id;

        // Get customer basic info (no sensitive data for privacy)
        const customer = await User.findOne({
            where: { id: customerId },
            attributes: ['id', 'name', 'profileImage', 'createdAt']
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Get seller's product IDs
        const sellerProducts = await Product.findAll({
            where: { sellerId },
            attributes: ['id', 'name', 'price']
        });
        const sellerProductIds = sellerProducts.map(p => p.id);

        if (sellerProductIds.length === 0) {
            return res.json({ customer: customer.toJSON(), orders: [], totalOrders: 0, totalSpent: 0 });
        }

        // Query orders directly for this customer, then filter items to seller's products only
        const orders = await Order.findAll({
            where: { customerId },
            include: [{
                model: OrderItem,
                as: 'items',
                where: { productId: { [Op.in]: sellerProductIds } },
                required: true,
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        const formattedOrders = orders.map(o => ({
            id: o.id,
            status: o.status,
            createdAt: o.createdAt,
            totalAmount: o.totalAmount,
            items: o.items.map(i => ({
                productId: i.productId,
                productName: i.product?.name,
                quantity: i.quantity,
                price: i.price
            }))
        }));

        const totalSpent = formattedOrders.reduce((sum, o) => {
            if (!['Cancelled', 'Cancellation Requested'].includes(o.status)) {
                return sum + o.items.reduce((s, i) => s + (parseFloat(i.price) * i.quantity), 0);
            }
            return sum;
        }, 0);

        res.json({
            customer: customer.toJSON(),
            orders: formattedOrders,
            totalOrders: formattedOrders.length,
            totalSpent
        });
    } catch (error) {
        console.error('Customer Profile Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



exports.getSellerProfile = async (req, res) => {
    try {
        const seller = await User.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['password', 'email'] }
        });

        if (!seller) {
            return res.status(404).json({ message: 'User not found' });
        }

        const products = await Product.findAll({
            where: { sellerId: seller.id },
            include: [{ model: ProductRating, as: 'ratings' }]
        });

        let totalRating = 0;
        let totalReviews = 0;

        products.forEach(p => {
            p.ratings.forEach(r => {
                totalRating += r.rating;
                totalReviews++;
            });
        });

        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '4.9';

        res.json({
            ...seller.toJSON(),
            profileImage: seller.profileImage,
            productCount: products.length,
            averageRating,
            totalReviews
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
