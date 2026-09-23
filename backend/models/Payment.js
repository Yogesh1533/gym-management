const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Membership payment record. Checkout is simulated (demo mode): no card data is stored or processed.
const Payment = sequelize.define('Payment', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:           { type: DataTypes.INTEGER, allowNull: false },
  membershipPlanId: { type: DataTypes.INTEGER, allowNull: false },
  amount:           { type: DataTypes.FLOAT,   allowNull: false },
  status:           { type: DataTypes.ENUM('paid', 'refunded'), defaultValue: 'paid' },
  reference:        { type: DataTypes.STRING,  allowNull: false },
  periodEnd:        { type: DataTypes.DATEONLY },
}, { tableName: 'payments' });

module.exports = Payment;
