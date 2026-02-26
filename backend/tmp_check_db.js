const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function checkDb() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const tables = await sequelize.query("SHOW TABLES", { type: QueryTypes.SELECT });
        console.log('Tables in database:', JSON.stringify(tables, null, 2));

        const columns = await sequelize.query("DESCRIBE Addresses", { type: QueryTypes.SELECT });
        console.log('Columns in Addresses table:', JSON.stringify(columns, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkDb();
