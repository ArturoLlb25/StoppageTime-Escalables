const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchCommentSchema = new Schema({
  matchId: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  parentId: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('MatchComment', matchCommentSchema);