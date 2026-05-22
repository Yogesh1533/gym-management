const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  memberId: { type: DataTypes.INTEGER, allowNull: false },
  sessionId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM('confirmed', 'cancelled', 'attended'),
    defaultValue: 'confirmed'
  },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'bookings',
  indexes: [{ unique: true, fields: ['memberId', 'sessionId'] }]
});

module.exports = Booking;
