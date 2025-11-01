const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');

exports.createContest = async (req, res) => {
  try {
    const { title, description, questionIds, startAt, durationSec } = req.body;
    if (!title || !questionIds || !startAt || !durationSec) return res.status(400).json({ msg: 'Missing required fields' });
    const contest = await Contest.create({ title, description, questions: questionIds, startAt, durationSec, createdBy: req.user.id });
    res.status(201).json(contest);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};

exports.getContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate({ path: 'questions', select: 'text choices difficulty' });
    if (!contest) return res.status(404).json({ msg: 'Contest not found' });
    res.json(contest);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};

exports.listContests = async (req, res) => {
  try {
    const contests = await Contest.find({ isActive: true }).sort({ startAt: -1 }).limit(100);
    res.json(contests);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};

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
      { $project: { user: { _id: 1, name: 1 }, score: 1, totalTime: 1, _id: 0 } }
    ]);
    res.json(results);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
};