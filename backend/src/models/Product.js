const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lowStockThreshold: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    category: {
        type: DataTypes.ENUM('Barong Tagalog', 'Filipiniana Dresses', 'Accessories', 'Others')
    },
    sellerId: {
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
        { fields: ['category'] },
        { fields: ['sellerId'] },
        { fields: ['price'] },
        { fields: ['name'] }
    ]
});

const ProductImage = sequelize.define('ProductImage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ProductId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

const ProductSize = sequelize.define('ProductSize', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    size: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ProductId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

const ProductRating = sequelize.define('ProductRating', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    review: {
        type: DataTypes.TEXT
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    ProductId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['ProductId'] },
        { fields: ['userId'] }
    ]
});

// Associations
User.hasMany(Product, { foreignKey: 'sellerId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller', onDelete: 'CASCADE' });

Product.hasMany(ProductImage, { as: 'images', foreignKey: 'ProductId', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'ProductId', onDelete: 'CASCADE' });

Product.hasMany(ProductSize, { as: 'availableSizes', foreignKey: 'ProductId', onDelete: 'CASCADE' });
ProductSize.belongsTo(Product, { foreignKey: 'ProductId', onDelete: 'CASCADE' });

Product.hasMany(ProductRating, { as: 'ratings', foreignKey: 'ProductId', onDelete: 'CASCADE' });
ProductRating.belongsTo(Product, { foreignKey: 'ProductId', onDelete: 'CASCADE' });

User.hasMany(ProductRating, { foreignKey: 'userId', onDelete: 'CASCADE' });
ProductRating.belongsTo(User, { foreignKey: 'userId', as: 'reviewer', onDelete: 'CASCADE' });

module.exports = { Product, ProductImage, ProductSize, ProductRating };
