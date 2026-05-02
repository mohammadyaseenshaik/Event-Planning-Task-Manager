const Task = require('../models/Task');
const { Event } = require('../models/Event');
const User = require('../models/User');
const TaskUpdate = require('../models/TaskUpdate');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, deadline, event, assignedTo } = req.body;

    if (!title || !deadline || !event) {
      return res.status(400).json({ success: false, message: 'Title, deadline and event are required' });
    }

    const eventExists = await Event.findByPk(event);
    if (!eventExists) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      deadline,
      eventId: event,
      assignedToId: assignedTo || null,
      createdById: req.user.id,
    });

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: Event, as: 'event', attributes: ['id', 'title'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    // Notify assigned member
    if (assignedTo) {
      await Notification.create({
        userId: assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${title}" in event: "${eventExists.title}"`,
        type: 'task_assigned',
        link: '/tasks'
      });
    }

    res.status(201).json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { event, status, priority, search } = req.query;
    let where = {};

    // Members only see their assigned tasks
    if (req.user.role === 'member') {
      where.assignedToId = req.user.id;
    }

    if (event) where.eventId = event;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: Event, as: 'event', attributes: ['id', 'title', 'date'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: Event, as: 'event', attributes: ['id', 'title'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Admin full update, Member status only)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Members can only update status
    if (req.user.role === 'member') {
      if (task.assignedToId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Members can only update task status' });
      }
      await task.update({ status });
    } else {
      // Admin can update all fields
      const updateData = { ...req.body };
      if (updateData.event) updateData.eventId = updateData.event;
      if (updateData.assignedTo) updateData.assignedToId = updateData.assignedTo;
      
      await task.update(updateData);
    }

    const updatedTask = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: Event, as: 'event', attributes: ['id', 'title'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    // Notify assigned member if assignment changed or task is updated
    if (req.user.role === 'admin' && req.body.assignedTo) {
      await Notification.create({
        userId: req.body.assignedTo,
        title: 'Task Updated',
        message: `Task "${updatedTask.title}" has been updated or reassigned to you.`,
        type: 'task_update',
        link: '/tasks'
      });
    }

    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await task.destroy();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'member') where.assignedToId = req.user.id;

    const tasks = await Task.findAll({ where });
    const now = new Date();

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const todo = tasks.filter((t) => t.status === 'To Do').length;
    const overdue = tasks.filter((t) => t.status !== 'Completed' && new Date(t.deadline) < now).length;

    const byPriority = {
      High: tasks.filter((t) => t.priority === 'High').length,
      Medium: tasks.filter((t) => t.priority === 'Medium').length,
      Low: tasks.filter((t) => t.priority === 'Low').length,
    };

    res.status(200).json({
      success: true,
      stats: { total, completed, inProgress, todo, overdue, byPriority },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add update/note to task
// @route   POST /api/tasks/:id/updates
// @access  Private
const addTaskUpdate = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ success: false, message: 'Note is required' });

    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const update = await TaskUpdate.create({
      note,
      taskId: req.params.id,
      userId: req.user.id,
    });

    const populatedUpdate = await TaskUpdate.findByPk(update.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
    });

    // Notify admins if a member added the update
    if (req.user.role === 'member') {
      const admins = await User.findAll({ where: { role: 'admin' } });
      const notifications = admins.map(admin => ({
        userId: admin.id,
        title: 'New Task Update',
        message: `${req.user.name} added a note to task: "${task.title}"`,
        type: 'task_update',
        link: `/tasks` // Or a more specific link if available
      }));
      await Notification.bulkCreate(notifications);
    }

    res.status(201).json({ success: true, update: populatedUpdate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get updates/notes for a task
// @route   GET /api/tasks/:id/updates
// @access  Private
const getTaskUpdates = async (req, res) => {
  try {
    const updates = await TaskUpdate.findAll({
      where: { taskId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({ success: true, updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent updates for dashboard
// @route   GET /api/tasks/recent-updates
// @access  Private
const getRecentUpdates = async (req, res) => {
  try {
    const updates = await TaskUpdate.findAll({
      limit: 5,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Task, as: 'task', attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getStats, addTaskUpdate, getTaskUpdates, getRecentUpdates };
