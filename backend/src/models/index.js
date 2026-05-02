const { sequelize } = require('../config/db');
const User = require('./User');
const { Event, EventMember } = require('./Event');
const Task = require('./Task');
const TaskUpdate = require('./TaskUpdate');
const Notification = require('./Notification');

// Export models and sequelize
module.exports = {
  sequelize,
  User,
  Event,
  EventMember,
  Task,
  TaskUpdate,
  Notification
};
