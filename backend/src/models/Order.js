const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const { Product } = require('./Product');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('GCash', 'COD'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Processing', 'To Ship', 'Shipped', 'To Be Delivered', 'Delivered', 'Completed', 'Cancellation Requested', 'Cancelled', 'Return Requested'),
        defaultValue: 'Pending'
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // paymentDetails
    referenceNumber: { type: DataTypes.STRING },
    receiptImage: { type: DataTypes.STRING },
    isPaymentVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    paymentVerifiedAt: { type: DataTypes.DATE },
    // review
    rating: { type: DataTypes.INTEGER },
    reviewComment: { type: DataTypes.TEXT },
    reviewImages: { type: DataTypes.JSON }, // Store as array of strings
    reviewCreatedAt: { type: DataTypes.DATE },
    customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['customerId'] },
        { fields: ['status'] },
        { fields: ['createdAt'] }
    ]
});

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

const ReturnRequest = sequelize.define('ReturnRequest', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    reason: { type: DataTypes.TEXT },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    },
    proofImages: { type: DataTypes.JSON },
    proofVideo: { type: DataTypes.STRING },
    requestedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    OrderId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

// Associations
User.hasMany(Order, { foreignKey: 'customerId', as: 'orders', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer', onDelete: 'CASCADE' });

Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', onDelete: 'CASCADE' });

Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
const OrderItemProductAssociation = OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product', onDelete: 'CASCADE' });

Order.hasOne(ReturnRequest, { foreignKey: 'OrderId', as: 'returnRequest', onDelete: 'CASCADE' });
ReturnRequest.belongsTo(Order, { foreignKey: 'OrderId', onDelete: 'CASCADE' });

module.exports = { Order, OrderItem, ReturnRequest };
