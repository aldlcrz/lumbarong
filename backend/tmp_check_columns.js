const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        const [p] = await sequelize.query('SHOW COLUMNS FROM Products');
        console.log('Products:', p.map(r => r.Field));
        const [oi] = await sequelize.query('SHOW COLUMNS FROM OrderItems');
        console.log('OrderItems:', oi.map(r => r.Field));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
