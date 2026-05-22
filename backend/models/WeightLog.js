const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WeightLog = sequelize.define('WeightLog', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:   { type: DataTypes.INTEGER, allowNull: false },
  weight:   { type: DataTypes.FLOAT,   allowNull: false },
  note:     { type: DataTypes.STRING },
}, { tableName: 'weight_logs' });

module.exports = WeightLog;
