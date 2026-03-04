const sequelize = require('./src/config/database');

async function checkSchema() {
    try {
        const [results] = await sequelize.query('DESCRIBE Products');
        console.log('Columns in Products table:');
        results.forEach(col => console.log(`- ${col.Field} (${col.Type})`));

        const [ratingResults] = await sequelize.query('DESCRIBE ProductRatings');
        console.log('\nColumns in ProductRatings table:');
        ratingResults.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
