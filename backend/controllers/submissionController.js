const Submission = require('../models/Submission');
const Contest = require('../models/Contest');

exports.submitAnswer = async (req, res) => {
  const userId = req.user.id;
  const contestId = req.params.id;
  const { questionIndex, answerIndex, timeTakenSec } = req.body;

  try {
    const contest = await Contest.findById(contestId).populate('questions');
    if (!contest) return res.status(404).json({ msg: 'Contest not found' });

    const now = Date.now();
    const start = new Date(contest.startAt).getTime();
    const end = start + (contest.durationSec * 1000);
    if (now < start) return res.status(400).json({ msg: 'Contest has not started yet' });
    if (now > end) return res.status(400).json({ msg: 'Contest has already ended' });

    if (questionIndex < 0 || questionIndex >= contest.questions.length) return res.status(400).json({ msg: 'Invalid question index' });

    const question = contest.questions[questionIndex];
    const isCorrect = (question.correctIndex === answerIndex);

    try {
      await Submission.create({ contestId, userId, questionIndex, answerIndex, timeTakenSec, isCorrect });
      return res.status(201).json({ msg: 'Answer submitted successfully', isCorrect });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ msg: 'You have already answered this question' });
      throw err;
    }
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};