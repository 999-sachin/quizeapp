const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateQuizFromPDF } = require('../controllers/quizGenerationController');
const { auth } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/generate-from-pdf', auth, upload.single('pdf'), generateQuizFromPDF);

module.exports = router;