const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getStats,
  addTaskUpdate,
  getTaskUpdates,
  getRecentUpdates,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/recent-updates', protect, getRecentUpdates);
router.route('/').get(protect, getTasks).post(protect, adminOnly, createTask);
router.route('/:id').get(protect, getTask).put(protect, updateTask).delete(protect, adminOnly, deleteTask);
router.route('/:id/updates').get(protect, getTaskUpdates).post(protect, addTaskUpdate);

module.exports = router;
