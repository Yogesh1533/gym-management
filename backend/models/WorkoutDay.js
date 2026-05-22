const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WorkoutDay = sequelize.define('WorkoutDay', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  workoutPlanId: { type: DataTypes.INTEGER, allowNull: false },
  day:           { type: DataTypes.STRING,  allowNull: false }, // Monday, Tuesday...
  focus:         { type: DataTypes.STRING },                    // Chest & Triceps
  order:         { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'workout_days' });

module.exports = WorkoutDay;
