const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionIndex: { type: Number, required: true },
  answerIndex: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  timeTakenSec: { type: Number, default: 0 },
  isCorrect: { type: Boolean }
});
submissionSchema.index({ contestId: 1, userId: 1, questionIndex: 1 }, { unique: true });
module.exports = mongoose.model('Submission', submissionSchema);