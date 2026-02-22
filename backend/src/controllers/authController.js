const User = require('../models/User');
const { Product, ProductRating } = require('../models/Product');
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
                isVerified: user.isVerified
            },
            message: 'Registration successful.'
        });
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
                isVerified: user.isVerified
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
        res.json({ message: 'Seller verification revoked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getSellerProfile = async (req, res) => {
    try {
        const seller = await User.findOne({
            where: { id: req.params.id, role: 'seller' },
            attributes: { exclude: ['password', 'email'] }
        });

        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
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
            productCount: products.length,
            averageRating,
            totalReviews
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
