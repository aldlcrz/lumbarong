const { Product, ProductImage, ProductSize, ProductRating, Category } = require('../models/Product');
const User = require('../models/User');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.getProducts = async (req, res) => {
    try {
        const { category, shop, priceMin, priceMax, search, categoryId, status } = req.query;
        let where = {};

        if (status) where.status = status;
        if (categoryId) where.CategoryId = categoryId;
        else if (category) {
            // Backward compatibility: Find category by name if ID isn't provided
            const cat = await Category.findOne({ where: { name: category } });
            if (cat) where.CategoryId = cat.id;
        }
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

        const currentUserId = req.user?.id || req.user?.userId;
        const products = await Product.findAll({
            where: {
                ...where,
                ...(req.user && req.user.role === 'admin'
                    ? {} // Admin sees all
                    : {
                        [Op.or]: [
                            { status: 'approved' },
                            ...(currentUserId ? [{ sellerId: currentUserId }] : [])
                        ]
                    }
                )
            },
            include: [
                { model: User, as: 'seller', attributes: ['id', 'name', 'shopName', 'profileImage', 'isVerified'] },
                { model: ProductImage, as: 'images' },
                { model: ProductSize, as: 'availableSizes' },
                { model: Category, as: 'category' }
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
                { model: User, as: 'seller', attributes: ['id', 'name', 'shopName', 'gcashNumber', 'profileImage', 'createdAt', 'isVerified'] },
                { model: ProductImage, as: 'images' },
                { model: ProductSize, as: 'availableSizes' },
                { model: Category, as: 'category' },
                { model: ProductRating, as: 'ratings', include: [{ model: User, as: 'reviewer', attributes: ['name'] }] }
            ]
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Calculate statistics
        const ratings = product.ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
            ? (ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1)
            : 0;

        const distribution = {
            1: ratings.filter(r => r.rating === 1).length,
            2: ratings.filter(r => r.rating === 2).length,
            3: ratings.filter(r => r.rating === 3).length,
            4: ratings.filter(r => r.rating === 4).length,
            5: ratings.filter(r => r.rating === 5).length
        };

        const result = {
            ...product.toJSON(),
            averageRating,
            totalRatings,
            ratingDistribution: distribution
        };

        res.json(result);
    } catch (error) {
        console.error('Error in getProductById:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const sellerId = req.user.id || req.user.userId;
        const user = await User.findByPk(sellerId);
        if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
            return res.status(403).json({ message: 'Artisan permissions required to showcase work.' });
        }

        if (user.role === 'seller' && !user.isVerified) {
            return res.status(403).json({ message: 'Your shop is pending approval. You cannot list products yet.' });
        }

        const { images, name, sizes, description, price, stock, categoryId, category } = req.body;
        if (!name) return res.status(400).json({ message: 'Product name is required.' });
        if (!images || images.length < 3) return res.status(400).json({ message: 'Minimum 3 images required.' });

        const productPrice = parseFloat(price);
        const productStock = parseInt(stock);

        if (isNaN(productPrice)) return res.status(400).json({ message: 'Invalid price.' });
        if (isNaN(productStock)) return res.status(400).json({ message: 'Invalid stock.' });

        const product = await Product.create({
            name,
            description,
            price: productPrice,
            stock: productStock,
            CategoryId: categoryId || category, // Support both for now
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

        if (req.app.get('io')) {
            req.app.get('io').emit('dashboard_update');
        }

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

        const currentUserId = req.user.id || req.user.userId;
        if (product.sellerId !== currentUserId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { images, sizes, price, stock, categoryId, category, ...rest } = req.body;

        const updateData = { ...rest };
        if (price !== undefined) updateData.price = parseFloat(price);
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (categoryId !== undefined) updateData.CategoryId = categoryId;
        else if (category !== undefined) updateData.CategoryId = category;

        await product.update(updateData, { transaction: t });

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

        if (req.app.get('io')) {
            req.app.get('io').emit('dashboard_update');
        }

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

exports.updateProductStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.status = status;
        await product.save();

        // Notify seller via Socket.IO if available
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${product.sellerId}`).emit('product_status_update', {
                productId: product.id,
                status,
                name: product.name
            });
            io.emit('dashboard_update');
        }

        res.json({ message: `Product ${status} successfully`, product });
    } catch (error) {
        console.error('Error in updateProductStatus:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
