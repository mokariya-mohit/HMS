const express = require('express');
const { registerAdmin, changePassword, loginAdmin, getAdmins, updateAdmin, deleteAdmin, forgotPassword, verifyOtp, resetPassword } = require('../controllers/adminController');
const router = express.Router();
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.post('/register', uploadMiddleware(), registerAdmin);
router.post('/login', loginAdmin);
router.get('/', getAdmins);
router.put('/:id', uploadMiddleware(), updateAdmin);
router.delete('/:id', deleteAdmin);
router.post('/change-password', changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
