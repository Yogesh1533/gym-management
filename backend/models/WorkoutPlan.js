const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WorkoutPlan = sequelize.define('WorkoutPlan', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:         { type: DataTypes.STRING,  allowNull: false },
  description:   { type: DataTypes.TEXT },
  level:         { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'beginner' },
  goal:          { type: DataTypes.ENUM('weight_loss', 'muscle_gain', 'endurance', 'general_fitness') },
  durationWeeks: { type: DataTypes.INTEGER, defaultValue: 4 },
  createdBy:     { type: DataTypes.INTEGER },
}, { tableName: 'workout_plans' });

module.exports = WorkoutPlan;
