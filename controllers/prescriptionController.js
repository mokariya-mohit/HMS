
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');

const Patient = require('../models/Patient');

// // Create a new prescription
// exports.createPrescription = async (req, res) => {
//     try {
//         const { appointmentId, patientId, medication, notes } = req.body;
//         const id = req.doctor._id;
//         const doctorId = id.toString()



//         if (!appointmentId || !patientId || !medication || !Array.isArray(medication) || medication.length === 0) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }

//         const appointment = await Appointment.findOne({ _id: appointmentId, doctorId });

//         if (!appointment) {
//             return res.status(404).json({ message: 'Appointment not found or unauthorized' });
//         }

//         const newPrescription = new Prescription({
//             appointmentId,
//             patientId,
//             doctorId,
//             medication,
//             notes,
//         });

//         await newPrescription.save();

//         res.status(201).json({ message: 'Prescription created successfully', newPrescription });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error creating prescription', error: error.message });
//     }
// };

// exports.createPrescription = async (req, res) => {
//     try {
//         const { appointmentId, patientId, medication, notes } = req.body; // Removed medicationCharge from here
//         const id = req.doctor._id;
//         const doctorId = id.toString();

//         if (!appointmentId || !patientId || !medication || !Array.isArray(medication) || medication.length === 0) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }

//         const appointment = await Appointment.findOne({ _id: appointmentId, doctorId });
//         if (!appointment) {
//             return res.status(404).json({ message: 'Appointment not found or unauthorized' });
//         }

//         const newPrescription = new Prescription({
//             appointmentId,
//             patientId,
//             doctorId,
//             medication,
//             notes,
//         });

//         await newPrescription.save();

//         // Calculate charges
//         const doctorCharge = 100;  // Fixed charge for doctor
//         const medicationCost = medication.reduce((total, med) => total + 20, 0);  // Example: Each medication costs $20

//         const totalAmount = doctorCharge + medicationCost;

//         // Include medicationCharge in the bill
//         const newBill = new Bill({
//             appointmentId,
//             patientId,
//             doctorId,
//             doctorCharge,
//             medicationCharge: medicationCost, // Provide medicationCharge
//             totalAmount
//         });

//         await newBill.save();

//         res.status(201).json({ 
//             message: 'Prescription and Bill created successfully', 
//             prescription: newPrescription, 
//             bill: newBill 
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error creating prescription or bill', error: error.message });
//     }
// };

const Doctor = require('../models/Doctor'); // Import Doctor model

exports.createPrescription = async (req, res) => {
    const { medicines, discount, insuranceCompany, insurancePlan, claimAmount } = req.body;
    const { patientId } = req.params; 
    const doctorId = req.doctor._id.toString(); 

    try {
        // Fetch patient details from the database
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Fetch doctor details to get the doctor's charge
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Calculate total price of medicines
        let medicineTotal = 0;
        medicines.forEach(medicine => {
            medicineTotal += parseFloat(medicine.price) * (medicine.quantity || 1); // Default quantity to 1 if not provided
        });

        // Add doctor's charge to the total price
        const doctorCharge = doctor.onlineConsultationRate || 0;
        let totalAmount = medicineTotal + doctorCharge;

        // Apply discount if available
        let discountAmount = 0;
        if (discount) {
            // Ensure discount is a valid number before calculation
            discountAmount = totalAmount * (parseFloat(discount) / 100); // Calculate discount as a percentage
            totalAmount -= discountAmount; // Subtract discount from total
        }

        // Check if there's insurance coverage
        let finalAmount = totalAmount; // Default to totalAmount if no insurance
        if (insuranceCompany && insurancePlan && claimAmount) {
            // Apply claim amount but ensure total cannot be less than 0
            finalAmount -= claimAmount;
            if (finalAmount < 0) finalAmount = 0; // Final amount cannot be negative
        }

        // Create the prescription
        const prescription = new Prescription({
            patientId,
            patientName: `${patient.firstName} ${patient.lastName}`, // Fetch patientName from Patient model
            age: patient.age,
            gender: patient.gender,
            medicines,
            doctorId,
            doctorConsultationRate: doctorCharge, // Fetch doctorConsultationRate from Doctor model
            discount,
            insuranceCompany,
            insurancePlan,
            claimAmount,
            totalPrice: medicineTotal + doctorCharge, // Total before discount and insurance
            finalAmount      // Final amount after applying discount and insurance
        });

        await prescription.save();

        // Create the bill with detailed breakdown, including insurance details
        const newBill = new Bill({
            patientId,
            patientName: `${patient.firstName} ${patient.lastName}`, // Fetch patientName from Patient model
            doctorId,
            doctorConsultationRate: doctorCharge, // Fetch doctorConsultationRate from Doctor model
            medicines, // Add medicine details to the Bill model
            medicationCharge: medicineTotal, // Medication total
            discount,
            discountAmount,     // Correctly assign discount amount
            claimAmount,        // Insurance claim amount
            insuranceCompany,   // Add insurance company to the Bill model
            insurancePlan,      // Add insurance plan to the Bill model
            totalAmount: medicineTotal + doctorCharge, // Total before applying discount and claim
            finalAmount         // Final amount to be paid after insurance claim and discount
        });

        await newBill.save();

        res.status(201).json({
            message: 'Prescription and Bill created successfully',
            prescription,
            bill: {
                doctorCharge,
                medicationCharge: medicineTotal,
                discountAmount,  // Ensure discount amount is shown in response
                claimAmount,
                insuranceCompany,   // Include insurance details in the response
                insurancePlan,      // Include insurance plan in the response
                totalAmount: medicineTotal + doctorCharge,
                finalAmount,
                medicines           // Add medicines in the response as well
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};



// Get prescriptions for a patient
exports.getPrescriptionsByPatient = async (req, res) => {
    const { prescriptionId } = req.params; // From URL params
    try {
        // Fetch the prescription from the database
        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        res.status(200).json(prescription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Update a prescription by ID
exports.updatePrescription = async (req, res) => {
    const { prescriptionId } = req.params; // From URL params
    const updates = req.body; // The updated prescription data
    const doctorId = req.doctor._id.toString(); // Get the doctor's ID

    try {
        // Fetch doctor details to get the doctor's charge
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Check if medicines are included in the update and calculate total price if necessary
        let totalPrice = 0;
        if (updates.medicines) {
            updates.medicines.forEach(medicine => {
                totalPrice += parseFloat(medicine.price) * (medicine.quantity || 1); // Default quantity to 1
            });
        }

        // Add doctor's charge to the total price
        const doctorCharge = doctor.onlineConsultationRate || 0;
        totalPrice += doctorCharge;

        // Apply discount if available
        let discountAmount = 0;
        if (updates.discount) {
            discountAmount = totalPrice * (updates.discount / 100); // Apply discount as a percentage
            totalPrice -= discountAmount;
        }

        // Check if there's insurance coverage and calculate the final amount
        let finalAmount = totalPrice; // Default to totalPrice if no insurance
        if (updates.insuranceCompany && updates.insurancePlan && updates.claimAmount) {
            finalAmount -= updates.claimAmount; // Subtract claim amount from the total
            if (finalAmount < 0) finalAmount = 0; // Ensure total doesn't go negative
        }

        // Update totalPrice and finalAmount in the updates object
        updates.totalPrice = totalPrice;
        updates.finalAmount = finalAmount;

        // Find and update the prescription with new details
        const updatedPrescription = await Prescription.findByIdAndUpdate(
            prescriptionId,
            updates,
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedPrescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        res.status(200).json({
            message: 'Prescription updated successfully',
            updatedPrescription
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};



exports.deletePrescription = async (req, res) => {
    const { prescriptionId } = req.params; // From URL params
    try {
        // Find and delete the prescription
        const deletedPrescription = await Prescription.findByIdAndDelete(prescriptionId);
        if (!deletedPrescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        res.status(200).json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};