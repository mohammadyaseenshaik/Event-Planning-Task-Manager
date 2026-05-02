const { Event, EventMember } = require('../models/Event');
const User = require('../models/User');
const { Op } = require('sequelize');

const transformEvent = (event) => {
  if (!event) return null;
  const json = event.get({ plain: true });
  if (json.members) {
    json.members = json.members.map(user => {
      const memberData = {
        user,
        role: user.EventMember ? user.EventMember.role : 'member'
      };
      // Remove the junction data from the user object to keep it clean
      delete user.EventMember;
      return memberData;
    });
  }
  // Also ensure _id is present if it's not already in JSON (virtuals should be there)
  if (json.id && !json._id) json._id = json.id;
  return json;
};

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, status } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ success: false, message: 'Title, description and date are required' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      status,
      createdBy: req.user.id,
    });

    // Add creator as admin member
    await EventMember.create({
      EventId: event.id,
      UserId: req.user.id,
      role: 'admin',
    });

    const updatedEvent = await Event.findByPk(event.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: ['role'] } },
      ],
    });

    res.status(201).json({ success: true, event: transformEvent(updatedEvent) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    let include = [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: ['role'] } },
    ];

    let where = {};

    // Members only see events they're part of
    if (req.user.role === 'member') {
      const memberEvents = await EventMember.findAll({
        where: { UserId: req.user.id },
        attributes: ['EventId'],
      });
      const eventIds = memberEvents.map(me => me.EventId);
      where.id = { [Op.in]: eventIds };
    }

    const events = await Event.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, count: events.length, events: events.map(transformEvent) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: ['role'] } },
      ],
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, event: transformEvent(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await event.update(req.body);

    const updatedEvent = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: ['role'] } },
      ],
    });

    res.status(200).json({ success: true, event: transformEvent(updatedEvent) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await event.destroy();
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to event
// @route   POST /api/events/:id/members
// @access  Private/Admin
const addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const event = await Event.findByPk(req.params.id);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyMember = await EventMember.findOne({
      where: { EventId: req.params.id, UserId: userId }
    });

    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    await EventMember.create({
      EventId: req.params.id,
      UserId: userId,
      role: role || 'member'
    });

    const updatedEvent = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: ['role'] } },
      ],
    });

    res.status(200).json({ success: true, event: transformEvent(updatedEvent) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from event
// @route   DELETE /api/events/:id/members/:userId
// @access  Private/Admin
const removeMember = async (req, res) => {
  try {
    const eventMember = await EventMember.findOne({
      where: { EventId: req.params.id, UserId: req.params.userId }
    });

    if (!eventMember) return res.status(404).json({ success: false, message: 'Membership not found' });

    await eventMember.destroy();

    const updatedEvent = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: ['role'] } },
      ],
    });

    res.status(200).json({ success: true, event: transformEvent(updatedEvent) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent, addMember, removeMember };
