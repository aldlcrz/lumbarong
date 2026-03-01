const User = require('../models/User');
const { Order } = require('../models/Order');
const { Product } = require('../models/Product');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { sendNotification } = require('../utils/notificationHelper');

exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.count({ where: { role: 'customer' } });
        const totalSellers = await User.count({ where: { role: 'seller' } });
        const totalOrders = await Order.count();
        const verifiedSellersCount = await User.count({ where: { role: 'seller', isVerified: true } });
        const pendingSellersCount = await User.count({ where: { role: 'seller', isVerified: false } });

        const revenue = await Order.sum('totalAmount', {
            where: {
                status: {
                    [Op.notIn]: ['Cancelled', 'Cancellation Requested']
                }
            }
        }) || 0;

        // Get recent pending sellers for registry preview
        const recentPendingSellers = await User.findAll({
            where: { role: 'seller', isVerified: false },
            attributes: ['id', 'name', 'shopName', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Get sales by product for platform trends
        const { OrderItem } = require('../models/Order');
        const orders = await Order.findAll({
            where: {
                status: {
                    [Op.notIn]: ['Cancelled', 'Cancellation Requested']
                }
            },
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['name']
                }]
            }]
        });

        const productSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.product) {
                    const name = item.product.name;
                    if (!productSales[name]) {
                        productSales[name] = 0;
                    }
                    productSales[name] += item.quantity;
                }
            });
        });

        const platformTrends = Object.keys(productSales).map(name => ({
            name,
            sales: productSales[name]
        })).sort((a, b) => b.sales - a.sales).slice(0, 10);

        res.json({
            totalUsers,
            totalSellers,
            verifiedSellersCount,
            pendingSellersCount,
            totalOrders,
            revenue,
            recentPendingSellers,
            platformTrends
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.destroy();

        if (req.app.get('io')) {
            req.app.get('io').emit('dashboard_update');
        }

        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



