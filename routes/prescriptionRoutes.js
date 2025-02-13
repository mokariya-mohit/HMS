
const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptionsByPatient, updatePrescription, deletePrescription } = require('../controllers/prescriptionController');
const { isAuthenticatedDoctor } = require('../middlewares/authMiddleware');

// router.post('/prescriptions', isAuthenticatedDoctor, createPrescription);
router.post('/prescriptions/:patientId', isAuthenticatedDoctor,createPrescription) , 
router.get('/prescriptions/patient/:prescriptionId', isAuthenticatedDoctor, getPrescriptionsByPatient);
router.delete('/prescriptions/:prescriptionId', isAuthenticatedDoctor, deletePrescription);
router.put('/prescriptions/:prescriptionId', isAuthenticatedDoctor, updatePrescription);

module.exports = router;
