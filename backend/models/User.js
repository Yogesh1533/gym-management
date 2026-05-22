const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'member'), defaultValue: 'member' },
  phone: { type: DataTypes.STRING },
  age: { type: DataTypes.INTEGER },
  weight: { type: DataTypes.FLOAT },
  height: { type: DataTypes.FLOAT },
  fitnessGoal: {
    type: DataTypes.ENUM('weight_loss', 'muscle_gain', 'endurance', 'general_fitness'),
    defaultValue: 'general_fitness'
  },
  profileImage: { type: DataTypes.STRING, defaultValue: '' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  workoutPlanId: { type: DataTypes.INTEGER, allowNull: true },
  dietPlanId: { type: DataTypes.INTEGER, allowNull: true },
  membershipPlanId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'users' });

User.beforeSave(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.prototype.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
