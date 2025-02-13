// models/Prescription.js

const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    strength: { type: String, required: true },
    dose: { type: String, required: true },
    duration: { type: String, required: true },
    whenToTake: { type: String, required: true },
    price: { type: String, required: true },
    quantity: { type: String, required: true },


});

const prescriptionSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    medicines: [medicationSchema],  // Array of medicines
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctorConsultationRate:{ type: Number, required: true },  // Add totalPrice field                          
    insuranceCompany:{ type: String },  // Add totalPrice field                          
    insurancePlan:{ type: String },  // Add totalPrice field                          
    discount:{ type: Number },  // Add totalPrice field                          
    claimAmount:{ type: Number },  // Add totalPrice field                          
    totalPrice: { type: Number, required: true },  // Add totalPrice field
    finalAmount: { type: Number, required: true },  // Add totalPrice field
          

}, { timestamps: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;
