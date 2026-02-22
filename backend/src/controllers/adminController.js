const User = require('../models/User');
const { Order } = require('../models/Order');
const { Product } = require('../models/Product');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.count({ where: { role: 'customer' } });
        const totalSellers = await User.count({ where: { role: 'seller' } });
        const totalOrders = await Order.count();

        const revenue = await Order.sum('totalAmount') || 0;

        // Simplified chart data
        const salesChart = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Sales',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: 'rgba(220, 38, 38, 0.5)',
            }]
        };

        const growthChart = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Users',
                data: [100, 200, 300, 400, 500, 600],
                borderColor: 'rgb(220, 38, 38)',
                tension: 0.1
            }]
        };

        // Get All Orders with their Items and Product details to calculate sales by product
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

        // Convert to array and sort by top selling
        const platformTrends = Object.keys(productSales).map(name => ({
            name,
            sales: productSales[name]
        })).sort((a, b) => b.sales - a.sales).slice(0, 10);

        res.json({
            totalUsers,
            totalSellers,
            totalOrders,
            revenue,
            topProduct: platformTrends.length > 0 ? platformTrends[0].name : 'No sales yet',
            platformTrends,
            salesChart,
            growthChart
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
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
