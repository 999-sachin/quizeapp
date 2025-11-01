const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

router.get('/', contestController.listContests);
router.get('/:id', contestController.getContest);
router.get('/:id/leaderboard', contestController.getLeaderboard);
router.post('/', auth, isAdmin, contestController.createContest);

module.exports = router;