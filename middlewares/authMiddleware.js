// const jwt = require('jsonwebtoken');
// const Admin = require('../models/Admin');

// const isAdmin = async (req, res, next) => {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const admin = await Admin.findById(decoded.id);

//         if (!admin) return res.status(401).json({ message: 'Not authorized as admin' });

//         req.admin = admin;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Token is not valid' });
//     }
// };

// module.exports = {
//     isAdmin,
// };
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// General authentication middleware
const authenticateUser = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Save decoded token data for use in the role check
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Admin authentication middleware
const isAdmin = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin) return res.status(401).json({ message: 'Not authorized as admin' });

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Patient authentication middleware
const isAuthenticatedPatient = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const patient = await Patient.findById(decoded.id);

        if (!patient) return res.status(401).json({ message: 'Not authorized as a patient' });

        req.patient = patient;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Doctor authentication middleware
const isAuthenticatedDoctor = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const doctor = await Doctor.findById(decoded.id);

        if (!doctor) return res.status(401).json({ message: 'Not authorized as a doctor' });

        req.doctor = doctor;

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = {
    authenticateUser,
    isAdmin,
    isAuthenticatedPatient,
    isAuthenticatedDoctor
};
