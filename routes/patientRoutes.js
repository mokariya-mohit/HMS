// const express = require('express');
// const { registerPatient, changePassword, loginPatient, getPatients, updatePatient, deletePatient, forgotPassword, verifyOtp, resetPassword } = require('../controllers/patientController');
// const router = express.Router();
// const { isAdmin } = require('../middlewares/authMiddleware');
// const uploadMiddleware = require('../middlewares/uploadMiddleware');


// router.post('/register', isAdmin, uploadMiddleware(), registerPatient);
// router.post('/login', loginPatient);
// router.get('/', getPatients);
// router.put('/:id', isAdmin, uploadMiddleware(), updatePatient);
// router.delete('/:id', isAdmin, deletePatient);
// router.post('/change-password', changePassword);
// router.post('/forgot-password', forgotPassword);
// router.post('/verify-otp', verifyOtp);
// router.post('/reset-password', resetPassword);


// module.exports = router;
const express = require('express');
const { registerPatient, changePassword, loginPatient, getPatients, updatePatient, deletePatient, forgotPassword, verifyOtp, resetPassword } = require('../controllers/patientController');
const { bookAppointment, getPaymentDetailsByOrderId, getPatientAppointments, getAppointmentById, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const { isAdmin, isAuthenticatedPatient } = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/register', isAdmin, uploadMiddleware(), registerPatient);
router.post('/login', loginPatient);
router.get('/', isAdmin, getPatients);
router.put('/:id', isAdmin, uploadMiddleware(), updatePatient);
router.delete('/:id', isAdmin, deletePatient);
router.post('/change-password', isAuthenticatedPatient, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

router.post('/appointments', isAuthenticatedPatient, bookAppointment);
router.get('/appointments', isAuthenticatedPatient, getPatientAppointments);
router.get('/appointments/:id', isAuthenticatedPatient, getAppointmentById);
router.put('/appointments/:id', isAuthenticatedPatient, updateAppointment);
router.delete('/appointments/:id', isAuthenticatedPatient, deleteAppointment);

router.get('/appointments/payment/:orderId', isAuthenticatedPatient, getPaymentDetailsByOrderId);


module.exports = router;
