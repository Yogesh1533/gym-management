const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DietFood = sequelize.define('DietFood', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dietMealId: { type: DataTypes.INTEGER, allowNull: false },
  name:       { type: DataTypes.STRING,  allowNull: false },
  quantity:   { type: DataTypes.STRING },
  calories:   { type: DataTypes.INTEGER, defaultValue: 0 },
  protein:    { type: DataTypes.FLOAT,   defaultValue: 0 },
  carbs:      { type: DataTypes.FLOAT,   defaultValue: 0 },
  fat:        { type: DataTypes.FLOAT,   defaultValue: 0 },
  order:      { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'diet_foods' });

module.exports = DietFood;
