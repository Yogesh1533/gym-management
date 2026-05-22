const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  recipientId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: {
    type: DataTypes.ENUM('booking_confirmed', 'new_session', 'plan_assigned', 'general'),
    defaultValue: 'general'
  },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  relatedSessionId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'notifications' });

module.exports = Notification;
