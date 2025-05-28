const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  newsId: {
    type: Schema.Types.ObjectId,
    ref: 'News',
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
    default: null,
    validate: {
      validator: function(v) {
        return v === null || mongoose.Types.ObjectId.isValid(v);
      },
      message: props => `${props.value} no es un ObjectId válido!`
    }
  }
});

module.exports = mongoose.model('Comment', commentSchema);