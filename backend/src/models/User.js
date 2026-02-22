const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'seller', 'customer'),
    defaultValue: 'customer'
  },
  phone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  shopName: {
    type: DataTypes.STRING
  },
  shopDescription: {
    type: DataTypes.TEXT
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  profileImage: {
    type: DataTypes.STRING
  },
  gcashNumber: {
    type: DataTypes.STRING
  },
  gcashQrCode: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['email'] },
    { fields: ['role'] }
  ]
});

module.exports = User;
