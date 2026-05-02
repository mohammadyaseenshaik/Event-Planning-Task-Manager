const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'upcoming',
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    },
  },
});

const EventMember = sequelize.define('EventMember', {
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member',
  },
});

// Relationships
Event.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
User.hasMany(Event, { foreignKey: 'createdBy' });

Event.belongsToMany(User, { through: EventMember, as: 'members' });
User.belongsToMany(Event, { through: EventMember, as: 'events' });

module.exports = { Event, EventMember };
