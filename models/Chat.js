const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['Doctor', 'Patient'], // Ensuring only 'Doctor' and 'Patient' are allowed values
    required: true
  },
  receiver: {
    type: String,
    enum: ['Doctor', 'Patient'], // Ensuring only 'Doctor' and 'Patient' are allowed values
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Doctor'
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Patient'
  },
  conversation: [messageSchema]
});

module.exports = mongoose.model('Chat', chatSchema);
