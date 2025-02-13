const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
    doctorId: { type: String, required: true },
    patientId: { type: String, required: true },
    roomName: { type: String, required: true },
    callDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VideoCall', videoCallSchema);
