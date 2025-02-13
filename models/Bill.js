// models/Bill.js
const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctorConsultationRate: { type: Number, required: true }, // Add this line
    totalAmount: { type: Number, required: true },
    discount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    insuranceCompany: { type: String, default: '' },
    insurancePlan: { type: String, default: '' },
    claimAmount: { type: Number, default: 0 },
    medicines: [{ 
        name: String,
        price: Number,
        quantity: Number
    }],
    createdAt: { type: Date, default: Date.now },
    finalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' }, 
});

module.exports = mongoose.model('Bill', BillSchema);
