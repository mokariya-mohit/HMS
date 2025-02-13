const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phoneNumber: { type: String, required: true },
    age: { type: String, required: true },
    height: { type: String, required: true },
    weight: { type: String, required: true },
    gender: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    Dob: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model('Patient', PatientSchema);
