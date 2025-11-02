const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

// Public routes
router.get('/', contestController.listContests);
router.get('/:id', auth, contestController.getContest); // Auth required to see contest details
router.get('/:id/leaderboard', contestController.getLeaderboard);

// Admin route
router.post('/', auth, isAdmin, contestController.createContest);

// CORRECTION: This route now correctly handles submissions for a specific contest.
router.post('/:id/submit', auth, contestController.submitAnswer);

module.exports = router;