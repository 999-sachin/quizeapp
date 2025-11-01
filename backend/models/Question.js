const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  choices: [{ text: String }],
  correctIndex: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'easy' }
});
module.exports = mongoose.model('Question', questionSchema);

