const Bill = require('../models/Bill');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');

exports.createBill = async (req, res) => {
    const { prescriptionId } = req.params; // Get prescription ID from URL params
    try {
        // Fetch prescription details
        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        // Fetch patient details
        const patient = await Patient.findById(prescription.patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Calculate total amount based on prescription data
        const medicines = prescription.medicines;
        let totalMedicineCost = medicines.reduce((total, medicine) => {
            return total + (parseFloat(medicine.price) * parseInt(medicine.quantity));
        }, 0);

        // Add doctor's consultation rate
        const doctorConsultationRate = prescription.doctorConsultationRate || 0;
        let totalAmount = totalMedicineCost + doctorConsultationRate;

        // Initialize discount and calculate final amounts
        const discount = prescription.discount || 0;
        const discountAmount = (discount / 100) * totalAmount;
        const finalAmount = totalAmount - discountAmount;

        // Create the bill
        const bill = new Bill({
            patientId: prescription.patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            doctorId: prescription.doctorId,
            totalAmount,
            discount,
            discountAmount, // Include calculated discountAmount in bill
            insuranceCompany: prescription.insuranceCompany,
            insurancePlan: prescription.insurancePlan,
            claimAmount: prescription.claimAmount,
            doctorConsultationRate,
            finalAmount, // Final amount after discount
            medicines: prescription.medicines,
            paymentStatus: "unpaid" // Default payment status
        });

        await bill.save();

        res.status(201).json({
            message: 'Bill created successfully',
            bill
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

