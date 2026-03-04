const { Order, OrderItem } = require('./src/models/Order');
const { Product, ProductImage, ProductRating } = require('./src/models/Product');
const User = require('./src/models/User');
const sequelize = require('./src/config/database');

async function testOrderQuery() {
    try {
        console.log('Testing complex Order include with ProductRating...');
        // Just get one order to test
        const oneOrder = await Order.findOne();
        if (!oneOrder) {
            console.log('No orders found to test.');
            return;
        }

        const order = await Order.findByPk(oneOrder.id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['name', 'price', 'id'],
                        include: [{ model: ProductImage, as: 'images' }]
                    }]
                },
                {
                    model: ProductRating,
                    as: 'ratings',
                    include: [{ model: User, as: 'reviewer', attributes: ['name', 'profileImage'] }]
                }
            ]
        });
        console.log('Query successful!');
    } catch (err) {
        console.error('Sequelize Error Name:', err.name);
        console.error('Sequelize Error Message:', err.message);
        if (err.sql) console.error('SQL:', err.sql);
    } finally {
        await sequelize.close();
    }
}

testOrderQuery();
