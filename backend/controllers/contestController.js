const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');

// Create a new contest (Admin only)
exports.createContest = async (req, res) => {
  try {
    const { title, description, questionIds, startAt, durationSec } = req.body;
    if (!title || !questionIds || !startAt || !durationSec) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }
    const contest = await Contest.create({
      title,
      description,
      questions: questionIds,
      startAt,
      durationSec,
      createdBy: req.user.id,
    });
    res.status(201).json(contest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get a single contest with its questions
exports.getContest = async (req, res) => {
  try {
    // Exclude correctIndex from the populated questions
    const contest = await Contest.findById(req.params.id).populate({
      path: 'questions',
      select: 'text choices difficulty',
    });
    if (!contest) {
      return res.status(404).json({ msg: 'Contest not found' });
    }
    res.json(contest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// List all active contests
exports.listContests = async (req, res) => {
  try {
    const contests = await Contest.find({ isActive: true }).sort({ startAt: -1 }).limit(100);
    res.json(contests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get the leaderboard for a contest
exports.getLeaderboard = async (req, res) => {
  try {
    const contestId = new mongoose.Types.ObjectId(req.params.id);
    const results = await Submission.aggregate([
      { $match: { contestId: contestId } },
      { $group: { _id: '$userId', score: { $sum: { $cond: ['$isCorrect', 1, 0] } }, totalTime: { $sum: '$timeTakenSec' } } },
      { $sort: { score: -1, totalTime: 1 } },
      { $limit: 100 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { user: { _id: 1, name: 1 }, score: 1, totalTime: 1, _id: 0 } },
    ]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// CORRECTION: Moved answer submission logic here to match the route.
exports.submitAnswer = async (req, res) => {
  const userId = req.user.id;
  const { id: contestId } = req.params;
  const { questionIndex, answerIndex, timeTakenSec } = req.body;

  try {
    const contest = await Contest.findById(contestId).populate('questions');
    if (!contest) return res.status(404).json({ msg: 'Contest not found' });

    const now = Date.now();
    const start = new Date(contest.startAt).getTime();
    const end = start + contest.durationSec * 1000;
    if (now < start) return res.status(400).json({ msg: 'Contest has not started yet' });
    if (now > end) return res.status(400).json({ msg: 'Contest has already ended' });

    if (questionIndex < 0 || questionIndex >= contest.questions.length) {
      return res.status(400).json({ msg: 'Invalid question index' });
    }

    const question = contest.questions[questionIndex];
    const isCorrect = question.correctIndex === answerIndex;

    try {
      await Submission.create({ contestId, userId, questionIndex, answerIndex, timeTakenSec, isCorrect });
      return res.status(201).json({ msg: 'Answer submitted successfully', isCorrect });
    } catch (err) {
      if (err.code === 11000) { // Duplicate key error
        return res.status(409).json({ msg: 'You have already answered this question' });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};