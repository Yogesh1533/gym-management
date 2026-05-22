const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Waitlist = sequelize.define('Waitlist', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  memberId:  { type: DataTypes.INTEGER, allowNull: false },
  sessionId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'waitlists',
  indexes: [{ unique: true, fields: ['memberId', 'sessionId'] }]
});

module.exports = Waitlist;
