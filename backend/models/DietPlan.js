const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DietPlan = sequelize.define('DietPlan', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:         { type: DataTypes.STRING,  allowNull: false },
  description:   { type: DataTypes.TEXT },
  goal:          { type: DataTypes.ENUM('weight_loss', 'muscle_gain', 'endurance', 'general_fitness') },
  dailyCalories: { type: DataTypes.INTEGER },
  restrictions:  { type: DataTypes.JSON, defaultValue: [] }, // keep as JSON — simple string array
  createdBy:     { type: DataTypes.INTEGER },
}, { tableName: 'diet_plans' });

module.exports = DietPlan;
