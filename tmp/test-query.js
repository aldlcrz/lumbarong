const { Order, OrderItem, ReturnRequest } = require('./backend/src/models/Order');
const { Product, ProductRating, ProductImage } = require('./backend/src/models/Product');
const User = require('./backend/src/models/User');
const sequelize = require('./backend/src/config/database');

async function testQuery() {
    try {
        console.log('Testing connection...');
        await sequelize.authenticate();
        console.log('Connection established.');

        // Get a sample order ID if possible, otherwise we'll just test the query structure with a fake UUID
        const sampleOrder = await Order.findOne({ attributes: ['id'] });
        const orderId = sampleOrder ? sampleOrder.id : '00000000-0000-0000-0000-000000000000';

        console.log(`Testing query for order: ${orderId}`);
        const order = await Order.findByPk(orderId, {
            include: [
                { model: User, as: 'customer', attributes: ['name', 'email', 'address'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['name', 'price', 'id', 'sellerId'],
                        include: [{ model: ProductImage, as: 'images' }]
                    }]
                },
                { model: ReturnRequest, as: 'returnRequest' },
                {
                    model: ProductRating,
                    as: 'ratings',
                    include: [{ model: User, as: 'reviewer', attributes: ['name', 'profileImage'] }]
                }
            ]
        });
        console.log('Query successful!');
    } catch (error) {
        console.error('QUERY FAILED!');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

testQuery();
