

const express = require('express');
const router = express.Router();
const { createBill } = require('../controllers/billController');
const { createPayment, capturePayment } = require('../controllers/paymentController');

// Create bill from prescription
router.post('/bills/:prescriptionId', createBill);

// PayPal payment routes
router.post('/payments', createPayment); // Create payment
router.post('/payments/capture', capturePayment); // Capture payment

module.exports = router;
