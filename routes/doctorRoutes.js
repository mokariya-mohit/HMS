const express = require('express');
const { registerDoctor, loginDoctor, changePassword, getDoctors, updateDoctor, deleteDoctor, forgotPassword, verifyOtp, resetPassword, getDoctorAppointments
} = require('../controllers/doctorController');

const router = express.Router();
const { isAdmin, isAuthenticatedDoctor } = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.post('/register', isAdmin, uploadMiddleware(), registerDoctor);
router.post('/login', loginDoctor);
router.get('/', getDoctors);
router.put('/:id', isAdmin, uploadMiddleware(), updateDoctor);
router.delete('/:id', isAdmin, deleteDoctor);
router.post('/change-password', changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

router.get('/appointments', isAuthenticatedDoctor, getDoctorAppointments);


module.exports = router;
