const { Order, OrderItem, ReturnRequest } = require('../models/Order');
const { Product } = require('../models/Product');
const User = require('../models/User');
const sequelize = require('../config/database');
const { sendNotification } = require('../utils/notificationHelper');
const { Op } = require('sequelize');

exports.createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, totalAmount, paymentMethod, shippingAddress, referenceNumber, receiptImage } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        const lockedProducts = [];

        // 1. LOCK stock for all items first (Prevents race condition)
        for (const item of items) {
            const product = await Product.findOne({
                where: { id: item.product },
                lock: t.LOCK.UPDATE,
                transaction: t
            });

            if (!product || product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product ? product.name : 'Unknown Product'}`);
            }
            lockedProducts.push({ product, quantity: item.quantity, price: item.price });
        }

        // 2. Create the Order
        const order = await Order.create({
            customerId: req.user.userId,
            totalAmount,
            paymentMethod,
            shippingAddress,
            referenceNumber,
            receiptImage,
            isPaymentVerified: false,
            status: 'Pending'
        }, { transaction: t });

        // 3. Create OrderItems and decrement stock
        for (let entry of lockedProducts) {
            await OrderItem.create({
                orderId: order.id,
                productId: entry.product.id,
                quantity: entry.quantity,
                price: entry.price
            }, { transaction: t });

            // Deduct stock using literal SQL (already guaranteed by lock, but following user's hint for atomic decrement)
            await entry.product.decrement('stock', { by: entry.quantity, transaction: t });

            if (entry.product.sellerId) {
                await sendNotification(entry.product.sellerId, `New order received for ${entry.product.name}`, 'order');
            }
        }

        await t.commit();
        await sendNotification(req.user.userId, 'Your order has been placed successfully. Mabuhay!', 'order');

        if (req.app.get('io')) {
            req.app.get('io').emit('dashboard_update');
        }

        res.status(201).json(order);
    } catch (error) {
        if (t) await t.rollback();
        console.error('Order Creation Error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        let where = {};
        if (req.user.role === 'customer') {
            where.customerId = req.user.userId;
        } else if (req.user.role === 'seller') {
            // Complex logic for sellers: see orders AS customer OR orders containing THEIR products
            const sellerProductIds = (await Product.findAll({
                where: { sellerId: req.user.userId },
                attributes: ['id']
            })).map(p => p.id);

            const ordersWithSellerProducts = (await OrderItem.findAll({
                where: { productId: { [Op.in]: sellerProductIds } },
                attributes: ['orderId']
            })).map(oi => oi.orderId);

            where[Op.or] = [
                { customerId: req.user.userId },
                { id: { [Op.in]: ordersWithSellerProducts } }
            ];
        }

        const orders = await Order.findAll({
            where,
            include: [
                { model: User, as: 'customer', attributes: ['name', 'email', 'address'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['name', 'price', 'images', 'id'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: User, as: 'customer', attributes: ['name', 'email', 'address'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['name', 'price', 'images', 'id'] }]
                },
                { model: ReturnRequest, as: 'returnRequest' }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Authorization check
        if (req.user.role === 'customer' && order.customerId !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: OrderItem, as: 'items' }]
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role === 'customer' && status !== 'Cancelled') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // ❌ Lazada Logic: Cannot cancel if already shipped
        if (status === 'Cancelled' && ['Shipped', 'Delivered', 'Completed'].includes(order.status)) {
            return res.status(400).json({
                message: "Cannot cancel. Order is already on the way or completed."
            });
        }

        // Restore stock if cancelling
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            for (let item of order.items) {
                const product = await Product.findByPk(item.productId, { transaction: t });
                if (product) {
                    await product.increment('stock', { by: item.quantity, transaction: t });
                }
            }
        }

        await order.update({ status }, { transaction: t });
        await t.commit();

        await sendNotification(order.customerId, `Your order status has been updated to: ${status}`, 'order');
        if (req.app.get('io')) {
            req.app.get('io').emit('dashboard_update');
        }
        res.json(order);
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.requestCancellation = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.customerId !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (['Shipped', 'To Be Delivered', 'Delivered', 'Completed'].includes(order.status)) {
            return res.status(400).json({ message: 'Order cannot be cancelled once it has been shipped.' });
        }

        await order.update({ status: 'Cancellation Requested' });

        for (let item of order.items) {
            if (item.product && item.product.sellerId) {
                await sendNotification(item.product.sellerId, `Cancellation requested for an order`, 'order');
            }
        }

        res.json({ message: 'Cancellation request sent', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.submitPaymentProof = async (req, res) => {
    try {
        const { referenceNumber, receiptImage } = req.body;
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.customerId !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await order.update({
            referenceNumber,
            receiptImage,
            isPaymentVerified: false
        });

        for (let item of order.items) {
            if (item.product && item.product.sellerId) {
                await sendNotification(item.product.sellerId, `Payment proof submitted for an order`, 'order');
            }
        }

        res.json({ message: 'Payment proof submitted successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { isVerified } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (req.user.role === 'customer') return res.status(403).json({ message: 'Unauthorized' });

        const updateData = {
            isPaymentVerified: isVerified,
            paymentVerifiedAt: isVerified ? new Date() : null
        };

        if (isVerified) {
            updateData.status = 'Processing';
        }

        await order.update(updateData);

        const statusMsg = isVerified ? 'verified' : 'rejected';
        await sendNotification(order.customerId, `Your GCash payment has been ${statusMsg}.`, 'order');

        res.json({ message: `Payment ${statusMsg} successfully`, order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.submitReview = async (req, res) => {
    try {
        const { rating, comment, images } = req.body;
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.customerId !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (order.status !== 'Completed') {
            return res.status(400).json({ message: 'Order must be completed before rating' });
        }

        await order.update({
            rating,
            reviewComment: comment,
            reviewImages: images,
            reviewCreatedAt: new Date()
        });

        for (let item of order.items) {
            if (item.product && item.product.sellerId) {
                await sendNotification(item.product.sellerId, `An order has been rated and completed!`, 'order');
            }
        }

        res.json({ message: 'Review submitted successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.submitReturnRequest = async (req, res) => {
    try {
        const { reason, proofImages, proofVideo } = req.body;
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.customerId !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (order.status !== 'Delivered' && order.status !== 'Completed') {
            return res.status(400).json({ message: 'Return can only be requested for delivered items' });
        }

        await ReturnRequest.create({
            OrderId: order.id,
            reason,
            proofImages,
            proofVideo,
            status: 'Pending',
            requestedAt: new Date()
        });

        await order.update({ status: 'Return Requested' });

        for (let item of order.items) {
            if (item.product && item.product.sellerId) {
                await sendNotification(item.product.sellerId, `Return requested for an order`, 'order');
            }
        }

        res.json({ message: 'Return request submitted', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.completeOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.customerId !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (order.status !== 'Delivered') {
            return res.status(400).json({ message: 'Order must be delivered before marking as completed' });
        }

        await order.update({ status: 'Completed' });

        if (req.app.get('io')) {
            req.app.get('io').emit('dashboard_update');
        }

        res.json({ message: 'Order marked as completed', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

