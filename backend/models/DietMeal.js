const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DietMeal = sequelize.define('DietMeal', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dietPlanId: { type: DataTypes.INTEGER, allowNull: false },
  mealType:   { type: DataTypes.STRING,  allowNull: false }, // Breakfast, Lunch...
  totalCalories: { type: DataTypes.INTEGER, defaultValue: 0 },
  order:      { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'diet_meals' });

module.exports = DietMeal;
