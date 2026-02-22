const { Order, OrderItem } = require('../models/Order');
const { Product } = require('../models/Product');
const Message = require('../models/Message');
const { Op } = require('sequelize');

exports.getSellerAnalytics = async (req, res) => {
    try {
        const sellerId = req.user.userId;

        // 1. Get all products owned by this seller
        const sellerProducts = await Product.findAll({
            where: { sellerId },
            attributes: ['id', 'name', 'price']
        });
        const productIds = sellerProducts.map(p => p.id);

        if (productIds.length === 0) {
            return res.json({
                revenue: 0,
                totalOrders: 0,
                deliveredOrders: 0,
                inquiryCount: 0,
                bestSellers: [],
                monthlyTrends: [],
                recentActivity: [],
                orderStatusDistribution: {
                    pending: 0,
                    processing: 0,
                    shipped: 0,
                    completed: 0,
                    cancelled: 0
                }
            });
        }

        // 1.5 Get unique inquiries (unique customers messaged)
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: sellerId },
                    { receiverId: sellerId }
                ]
            },
            attributes: ['senderId', 'receiverId']
        });

        const uniqueInquirers = new Set();
        messages.forEach(msg => {
            if (msg.senderId !== sellerId) uniqueInquirers.add(msg.senderId);
            if (msg.receiverId !== sellerId) uniqueInquirers.add(msg.receiverId);
        });
        const inquiryCount = uniqueInquirers.size;

        // 2. Fetch orders containing these products
        const orders = await Order.findAll({
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    where: { productId: { [Op.in]: productIds } },
                    include: [{ model: Product, as: 'product', attributes: ['name', 'sellerId'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // 3. Process Analytics
        let totalRevenue = 0;
        let deliveredOrdersCount = 0;
        const productStats = {};
        const monthlyData = {};

        orders.forEach(order => {
            const isValidForRevenue = !['Cancelled', 'Cancellation Requested'].includes(order.status);

            order.items.forEach(item => {
                if (item.product && item.product.sellerId === sellerId) {
                    const itemRevenue = item.price * item.quantity;

                    if (isValidForRevenue) {
                        totalRevenue += Number(itemRevenue);
                    }

                    const pid = item.productId;
                    if (!productStats[pid]) {
                        productStats[pid] = { name: item.product.name, qty: 0, revenue: 0 };
                    }
                    productStats[pid].qty += item.quantity;
                    if (isValidForRevenue) {
                        productStats[pid].revenue += Number(itemRevenue);
                    }
                }
            });

            if (order.status === 'Completed' || order.status === 'Delivered') {
                deliveredOrdersCount++;
            }

            // Monthly Trends
            const date = new Date(order.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { revenue: 0, orders: 0 };
            }
            monthlyData[monthKey].orders++;
            if (isValidForRevenue) {
                let sellerOrderRevenue = 0;
                order.items.forEach(item => {
                    if (item.product && item.product.sellerId === sellerId) {
                        sellerOrderRevenue += Number(item.price * item.quantity);
                    }
                });
                monthlyData[monthKey].revenue += sellerOrderRevenue;
            }
        });

        const bestSellers = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const sortedMonths = Object.keys(monthlyData).sort().reverse().slice(0, 6).reverse();
        const monthlyTrends = sortedMonths.map(month => ({
            month,
            revenue: monthlyData[month].revenue,
            orders: monthlyData[month].orders
        }));

        res.json({
            revenue: totalRevenue,
            totalOrders: orders.length,
            deliveredOrders: deliveredOrdersCount,
            inquiryCount,
            bestSellers,
            monthlyTrends,
            orderStatusDistribution: {
                pending: orders.filter(o => o.status === 'Pending').length,
                processing: orders.filter(o => o.status === 'Processing' || o.status === 'To Ship').length,
                shipped: orders.filter(o => o.status === 'Shipped').length,
                completed: orders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length,
                cancelled: orders.filter(o => o.status === 'Cancelled').length
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server error fetching analytics', error: error.message });
    }
};
