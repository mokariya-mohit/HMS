// const mongoose = require('mongoose');

// const DoctorSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     qualification: { type: String, required: true },
//     gender: { type: String, required: true },
//     profileImage: { type: String, required: true },
//     signatureImage: { type: String, required: true },
//     profilePublicId: { type: String, required: true },
//     signaturePublicId: { type: String, required: true },
//     specialtyType: { type: String, required: true },
//     workOn: { type: String, required: true },
//     workingTime: { type: String, required: true },
//     checkUpTime: { type: String, required: true },
//     breakTime: { type: String, required: true },
//     experience: { type: String, required: true },
//     phoneNumber: { type: String, required: true },
//     age: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     country: { type: String, required: true },
//     state: { type: String, required: true },
//     city: { type: String, required: true },
//     zipCode: { type: String, required: true },
//     doctorAddress: { type: String, required: true },
//     description: { type: String, required: true },
//     onlineConsultationRate: { type: String, required: true },
//     currentHospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
//     hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
//     hospitalAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
//     hospitalWebsiteLink: { type: String, required: true },
//     emergencyPhoneNumber: { type: String, required: true },
//     password: { type: String, required: true },
// });

// module.exports = mongoose.model('Doctor', DoctorSchema);


const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qualification: { type: String, required: true },
    gender: { type: String, required: true },
    profileImage: { type: String, required: true },
    signatureImage: { type: String, required: true },
    profilePublicId: { type: String, required: true },
    signaturePublicId: { type: String, required: true },
    specialtyType: { type: String, required: true },
    workOn: { type: String, required: true },
    workingTime: { type: String, required: true }, // e.g., "09:00 AM - 05:00 PM"
    checkUpTime: { type: String, required: true }, // Duration in minutes, e.g., 30
    breakTime: { type: String, required: true }, // e.g., "12:00 PM - 01:00 PM, 03:00 PM - 03:30 PM"
    experience: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    age: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    doctorAddress: { type: String, required: true },
    description: { type: String, required: true },
    onlineConsultationRate: { type: Number, required: true }, // Changed to Number for easier calculations
    currentHospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    hospitalAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    hospitalWebsiteLink: { type: String, required: true },
    emergencyPhoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    scheduledAppointments: [{
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
        appointmentDate: { type: Date, required: true },
        appointmentTime: { type: String, required: true },
    }],
});

// Add indexes for optimized queries
DoctorSchema.index({ email: 1 });

const Doctor = mongoose.model('Doctor', DoctorSchema);
module.exports = Doctor;
