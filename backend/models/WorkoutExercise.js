const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WorkoutExercise = sequelize.define('WorkoutExercise', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  workoutDayId: { type: DataTypes.INTEGER, allowNull: false },
  name:         { type: DataTypes.STRING,  allowNull: false },
  sets:         { type: DataTypes.INTEGER },
  reps:         { type: DataTypes.STRING },
  duration:     { type: DataTypes.STRING },
  notes:        { type: DataTypes.STRING },
  order:        { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'workout_exercises' });

module.exports = WorkoutExercise;
