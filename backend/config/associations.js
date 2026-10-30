const User           = require('../models/User');
const WorkoutPlan    = require('../models/WorkoutPlan');
const WorkoutDay     = require('../models/WorkoutDay');
const WorkoutExercise= require('../models/WorkoutExercise');
const DietPlan       = require('../models/DietPlan');
const DietMeal       = require('../models/DietMeal');
const DietFood       = require('../models/DietFood');
const Session        = require('../models/Session');
const Booking        = require('../models/Booking');
const Notification   = require('../models/Notification');
const WeightLog      = require('../models/WeightLog');
const Rating         = require('../models/Rating');
const Waitlist       = require('../models/Waitlist');
const MembershipPlan = require('../models/MembershipPlan');
const Payment        = require('../models/Payment');
require('../models/Lead');

// User belongs to plans
User.belongsTo(WorkoutPlan,    { foreignKey: 'workoutPlanId',    as: 'workoutPlan' });
User.belongsTo(DietPlan,       { foreignKey: 'dietPlanId',       as: 'dietPlan' });
User.belongsTo(MembershipPlan, { foreignKey: 'membershipPlanId', as: 'membershipPlan' });

// Plans created by user
WorkoutPlan.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
DietPlan.belongsTo(User,    { foreignKey: 'createdBy', as: 'creator' });

// WorkoutPlan → WorkoutDay → WorkoutExercise
WorkoutPlan.hasMany(WorkoutDay,      { foreignKey: 'workoutPlanId', as: 'days',      onDelete: 'CASCADE' });
WorkoutDay.belongsTo(WorkoutPlan,    { foreignKey: 'workoutPlanId', as: 'workoutPlan' });
WorkoutDay.hasMany(WorkoutExercise,  { foreignKey: 'workoutDayId',  as: 'exercises', onDelete: 'CASCADE' });
WorkoutExercise.belongsTo(WorkoutDay,{ foreignKey: 'workoutDayId',  as: 'day' });

// DietPlan → DietMeal → DietFood
DietPlan.hasMany(DietMeal,   { foreignKey: 'dietPlanId', as: 'meals',  onDelete: 'CASCADE' });
DietMeal.belongsTo(DietPlan, { foreignKey: 'dietPlanId', as: 'dietPlan' });
DietMeal.hasMany(DietFood,   { foreignKey: 'dietMealId', as: 'foods',  onDelete: 'CASCADE' });
DietFood.belongsTo(DietMeal, { foreignKey: 'dietMealId', as: 'meal' });

// Bookings
Booking.belongsTo(User,    { foreignKey: 'memberId',   as: 'member' });
Booking.belongsTo(Session, { foreignKey: 'sessionId',  as: 'session' });
User.hasMany(Booking,      { foreignKey: 'memberId' });
Session.hasMany(Booking,   { foreignKey: 'sessionId' });

// Notifications
Notification.belongsTo(User,    { foreignKey: 'recipientId',     as: 'recipient' });
Notification.belongsTo(Session, { foreignKey: 'relatedSessionId',as: 'relatedSession' });

// Weight Logs
WeightLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(WeightLog,   { foreignKey: 'userId' });

// Ratings
Rating.belongsTo(User,    { foreignKey: 'memberId',  as: 'member' });
Rating.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });
Session.hasMany(Rating,   { foreignKey: 'sessionId' });

// Waitlist
Waitlist.belongsTo(User,    { foreignKey: 'memberId',  as: 'member' });
Waitlist.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });
Session.hasMany(Waitlist,   { foreignKey: 'sessionId' });

// Membership Plans
MembershipPlan.hasMany(User, { foreignKey: 'membershipPlanId' });

// Payments
Payment.belongsTo(User,           { foreignKey: 'userId',           as: 'user' });
Payment.belongsTo(MembershipPlan, { foreignKey: 'membershipPlanId', as: 'plan' });
User.hasMany(Payment,             { foreignKey: 'userId' });

module.exports = {};
