const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const { Event } = require('./Event');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      len: [1, 150],
    },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('To Do', 'In Progress', 'Completed'),
    defaultValue: 'To Do',
  },
  priority: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    defaultValue: 'Medium',
  },
  deadline: {
    type: DataTypes.DATE,
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
Task.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(Task, { foreignKey: 'eventId' });

Task.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });
User.hasMany(Task, { foreignKey: 'assignedToId' });

Task.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });
User.hasMany(Task, { foreignKey: 'createdById' });

module.exports = Task;
