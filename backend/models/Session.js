const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Session = sequelize.define('Session', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  trainer: { type: DataTypes.STRING, allowNull: false },
  sessionType: {
    type: DataTypes.ENUM('yoga', 'cardio', 'strength', 'hiit', 'pilates', 'crossfit', 'general'),
    defaultValue: 'general'
  },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  startTime: { type: DataTypes.STRING, allowNull: false },
  endTime: { type: DataTypes.STRING, allowNull: false },
  totalSlots: { type: DataTypes.INTEGER, defaultValue: 10 },
  bookedSlots: { type: DataTypes.INTEGER, defaultValue: 0 },
  location: { type: DataTypes.STRING, defaultValue: 'Main Gym Floor' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdBy: { type: DataTypes.INTEGER },
}, {
  tableName: 'sessions',
  getterMethods: {
    availableSlots() { return this.totalSlots - this.bookedSlots; }
  }
});

module.exports = Session;
