// const mongoose = require('mongoose');

// const appointmentSchema = new mongoose.Schema({
//     patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
//     doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
//     appointmentType: { type: String, enum: ['Online', 'Offline'], required: true },
//     appointmentDate: { type: Date, required: true },
//     appointmentTime: { type: String, required: true },
//     patientIssue: { type: String },
//     diseaseName: { type: String },
//     paymentStatus: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
//     paymentMethod: { type: String, enum: ['Online', 'Offline', 'PayPal'], required: true },
//     paymentOrderId: { type: String },
//     status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
// });

// const Appointment = mongoose.model('Appointment', appointmentSchema);
// module.exports = Appointment;


const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentType: { type: String, enum: ['Online', 'Offline'], required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true }, // e.g., "10:00 AM"
    patientIssue: { type: String },
    diseaseName: { type: String },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
});

// Add indexes for optimized queries
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
