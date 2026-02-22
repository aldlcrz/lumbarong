const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const { Product } = require('./Product');

const Wishlist = sequelize.define('Wishlist', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Product,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        { unique: true, fields: ['userId', 'productId'] }
    ]
});

// Associations
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Wishlist, { foreignKey: 'productId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = Wishlist;
