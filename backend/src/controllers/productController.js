const { Product, ProductImage, ProductSize, ProductRating } = require('../models/Product');
const User = require('../models/User');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.getProducts = async (req, res) => {
    try {
        const { category, shop, priceMin, priceMax, search } = req.query;
        let where = {};

        if (category) where.category = category;
        if (shop) where.sellerId = shop;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }
        if (priceMin || priceMax) {
            where.price = {};
            if (priceMin) where.price[Op.gte] = Number(priceMin);
            if (priceMax) where.price[Op.lte] = Number(priceMax);
        }

        const products = await Product.findAll({
            where,
            include: [
                { model: User, as: 'seller', attributes: ['name', 'shopName', 'gcashNumber', 'profileImage', 'createdAt', 'isVerified'] },
                { model: ProductImage, as: 'images' },
                { model: ProductSize, as: 'availableSizes' },
                { model: ProductRating, as: 'ratings' }
            ]
        });
        res.json(products);
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: User, as: 'seller', attributes: ['name', 'shopName', 'gcashNumber', 'profileImage', 'createdAt', 'isVerified'] },
                { model: ProductImage, as: 'images' },
                { model: ProductSize, as: 'availableSizes' },
                { model: ProductRating, as: 'ratings', include: [{ model: User, as: 'reviewer', attributes: ['name'] }] }
            ]
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        console.error('Error in getProductById:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const sellerId = req.user.userId || req.user.id;
        const user = await User.findByPk(sellerId);
        if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
            return res.status(403).json({ message: 'Artisan permissions required to showcase work.' });
        }

        if (user.role === 'seller' && !user.isVerified) {
            return res.status(403).json({ message: 'Your shop is pending approval. You cannot list products yet.' });
        }

        const { images, name, sizes, description, price, stock, category } = req.body;
        if (!name) return res.status(400).json({ message: 'Product name is required.' });
        if (!images || images.length < 3) return res.status(400).json({ message: 'Minimum 3 images required.' });

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            category,
            sellerId
        }, { transaction: t });

        // Add images
        if (images && images.length > 0) {
            await ProductImage.bulkCreate(
                images.map(url => ({ url, ProductId: product.id })),
                { transaction: t }
            );
        }

        // Add sizes
        if (sizes && sizes.length > 0) {
            await ProductSize.bulkCreate(
                sizes.map(size => ({ size, ProductId: product.id })),
                { transaction: t }
            );
        }

        await t.commit();

        // Return full product
        const createdProduct = await Product.findByPk(product.id, {
            include: [{ model: ProductImage, as: 'images' }, { model: ProductSize, as: 'availableSizes' }]
        });
        res.status(201).json(createdProduct);
    } catch (error) {
        if (t) await t.rollback();
        console.error('CRITICAL: Error in createProduct:', error);
        console.error('Request Body:', req.body);
        res.status(500).json({ message: 'Server error showcasing masterpiece', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.sellerId !== (req.user.userId || req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { images, sizes, ...rest } = req.body;
        await product.update(rest, { transaction: t });

        if (images) {
            await ProductImage.destroy({ where: { ProductId: product.id }, transaction: t });
            await ProductImage.bulkCreate(
                images.map(url => ({ url, ProductId: product.id })),
                { transaction: t }
            );
        }

        if (sizes) {
            await ProductSize.destroy({ where: { ProductId: product.id }, transaction: t });
            await ProductSize.bulkCreate(
                sizes.map(size => ({ size, ProductId: product.id })),
                { transaction: t }
            );
        }

        await t.commit();
        const updatedProduct = await Product.findByPk(product.id, {
            include: [{ model: ProductImage, as: 'images' }, { model: ProductSize, as: 'availableSizes' }]
        });
        res.json(updatedProduct);
    } catch (error) {
        if (t) await t.rollback();
        console.error('Error in updateProduct:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.sellerId !== (req.user.userId || req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.rateProduct = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const newRating = await ProductRating.create({
            ProductId: product.id,
            userId: req.user.userId || req.user.id,
            rating,
            review
        });

        // Emit real-time update
        const io = req.app.get('io');
        const user = await User.findByPk(req.user.userId || req.user.id, { attributes: ['name'] });

        io.to(`product_${product.id}`).emit('new_review', {
            ...newRating.toJSON(),
            reviewer: { name: user.name }
        });

        res.json({ message: 'Rating submitted', rating: newRating });
    } catch (error) {
        console.error('Error in rateProduct:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { stock } = req.body;
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.sellerId !== (req.user.userId || req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        product.stock = stock;
        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Error in updateStock:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
