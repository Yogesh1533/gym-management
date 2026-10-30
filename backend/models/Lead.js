const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// A visitor who asked for a free trial from the public website
const Lead = sequelize.define('Lead', {
  id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:    { type: DataTypes.STRING,  allowNull: false },
  email:   { type: DataTypes.STRING,  allowNull: false },
  phone:   { type: DataTypes.STRING },
  goal:    { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT },
  status:  { type: DataTypes.ENUM('new', 'contacted', 'converted', 'closed'), defaultValue: 'new' },
}, { tableName: 'leads' });

module.exports = Lead;
