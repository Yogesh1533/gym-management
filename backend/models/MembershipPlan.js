const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MembershipPlan = sequelize.define('MembershipPlan', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:          { type: DataTypes.STRING,  allowNull: false },
  tier:          { type: DataTypes.ENUM('basic', 'standard', 'premium', 'annual'), defaultValue: 'basic' },
  price:         { type: DataTypes.FLOAT,   allowNull: false },
  billingCycle:  { type: DataTypes.ENUM('monthly', 'yearly'), defaultValue: 'monthly' },
  sessionLimit:  { type: DataTypes.INTEGER, defaultValue: -1 }, // -1 = unlimited
  features:      { type: DataTypes.JSON,    defaultValue: [] },
  isActive:      { type: DataTypes.BOOLEAN, defaultValue: true },
  color:         { type: DataTypes.STRING,  defaultValue: '#06b6d4' },
}, { tableName: 'membership_plans' });

module.exports = MembershipPlan;
