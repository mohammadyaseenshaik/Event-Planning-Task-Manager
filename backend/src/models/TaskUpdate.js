const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Task = require('./Task');

const TaskUpdate = sequelize.define('TaskUpdate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    },
  },
});

// Relationships
TaskUpdate.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Task.hasMany(TaskUpdate, { foreignKey: 'taskId', as: 'updates' });

TaskUpdate.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(TaskUpdate, { foreignKey: 'userId' });

module.exports = TaskUpdate;
