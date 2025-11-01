const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const submissionController = require('../controllers/submissionController');

// Note: The route is now more specific to avoid conflicts.
router.post('/:id/submit', auth, submissionController.submitAnswer);

module.exports = router;