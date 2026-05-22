const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Rating = sequelize.define('Rating', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  memberId:  { type: DataTypes.INTEGER, allowNull: false },
  sessionId: { type: DataTypes.INTEGER, allowNull: false },
  rating:    { type: DataTypes.INTEGER, allowNull: false }, // 1-5
  review:    { type: DataTypes.TEXT },
}, {
  tableName: 'ratings',
  indexes: [{ unique: true, fields: ['memberId', 'sessionId'] }]
});

module.exports = Rating;
