const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const orderRoutes = require('../src/routes/orderRoutes');
const { Order, OrderItem } = require('../src/models/Order');
const { Product } = require('../src/models/Product');
const User = require('../src/models/User');
const sequelize = require('../src/config/database');
const jwt = require('jsonwebtoken');

// Mock Auth Middleware
jest.mock('../src/middleware/authMiddleware', () => {
    return (roles) => (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = decoded;
            if (roles && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            next();
        } catch (err) {
            res.status(401).json({ message: 'Invalid token' });
        }
    };
});

const app = express();
app.use(bodyParser.json());
app.use('/api/orders', orderRoutes);

describe('Order System API', () => {
    let customerToken, sellerToken, productId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const customer = await User.create({
            name: 'Test Customer',
            email: 'customer@test.com',
            password: 'password123',
            role: 'customer'
        });
        customerToken = jwt.sign({ userId: customer.id, role: 'customer' }, 'secret');

        const seller = await User.create({
            name: 'Test Seller',
            email: 'seller@test.com',
            password: 'password123',
            role: 'seller'
        });
        sellerToken = jwt.sign({ userId: seller.id, role: 'seller' }, 'secret');

        const product = await Product.create({
            name: 'Test Barong',
            description: 'Beautiful Barong',
            price: 5000,
            stock: 10,
            sellerId: seller.id,
            category: 'Barong Tagalog'
        });
        productId = product.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should create an order as customer', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                items: [{ product: productId, quantity: 2, price: 5000 }],
                totalAmount: 10000,
                paymentMethod: 'COD',
                shippingAddress: '123 Test St'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');

        const product = await Product.findByPk(productId);
        expect(product.stock).toBe(8);
    });

    it('should get orders for customer', async () => {
        const res = await request(app)
            .get('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get orders for seller if it contains their product', async () => {
        const res = await request(app)
            .get('/api/orders')
            .set('Authorization', `Bearer ${sellerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should get single order details', async () => {
        const orders = await Order.findAll();
        const orderId = orders[0].id;

        const res = await request(app)
            .get(`/api/orders/${orderId}`)
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toBe(orderId);
        expect(res.body.items.length).toBeGreaterThan(0);
    });
});
