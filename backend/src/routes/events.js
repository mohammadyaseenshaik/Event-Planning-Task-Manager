const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  addMember,
  removeMember,
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(protect, getEvents).post(protect, adminOnly, createEvent);
router.route('/:id').get(protect, getEvent).put(protect, adminOnly, updateEvent).delete(protect, adminOnly, deleteEvent);
router.route('/:id/members').post(protect, adminOnly, addMember);
router.route('/:id/members/:userId').delete(protect, adminOnly, removeMember);

module.exports = router;
