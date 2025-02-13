const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require('../utils/cloudinaryConfig');
const crypto = require('crypto');
const otps = {};

const formatWorkingTime = (workingTime) => {
    const timePattern = /(\d+)\s*(AM|PM)/g;
    return workingTime.replace(timePattern, (match, hours, period) => {
        const paddedHours = String(hours).padStart(2, '0');
        return `${paddedHours}:00 ${period}`; 
    });
};

const formatBreakTime = (breakTime) => {
    const timePattern = /(\d+)\s*(AM|PM)/g;
    return breakTime.replace(timePattern, (match, hours, period) => {
        const paddedHours = String(hours).padStart(2, '0');
        return `${paddedHours}:00 ${period}`;
    });
};

// Register a new doctor
exports.registerDoctor = async (req, res) => {
    try {
        const {
            name,
            qualification,
            gender,
            experience,
            checkUpTime,
            workOn,
            specialtyType,
            workingTime,
            breakTime,
            age,
            phoneNumber,
            email,
            city,
            state,
            country,
            doctorAddress,
            zipCode,
            description,
            hospital,
            currentHospital,
            hospitalWebsiteLink,
            emergencyPhoneNumber,
            hospitalAddress,
            onlineConsultationRate,
            password,
            confirmPassword
        } = req.body;

        
        const formattedWorkingTime = formatWorkingTime(workingTime);
        const formattedBreakTime = formatBreakTime(breakTime); 

        if (!req.files || !req.files.signatureImage || !req.files.profileImage) {
            return res.status(400).json({ message: "Both signature and profile images are required." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        const signatureImageFile = req.files.signatureImage;
        const profileImageFile = req.files.profileImage;

        const signatureImageResult = await cloudinary.uploader.upload(signatureImageFile.tempFilePath, {
            folder: 'doctors',
        });
        const profileImageResult = await cloudinary.uploader.upload(profileImageFile.tempFilePath, {
            folder: 'doctors',
        });
        const hashedPassword = await bcrypt.hash(password, 10);

        const newDoctor = new Doctor({
            name,
            qualification,
            gender,
            specialtyType,
            workingTime: formattedWorkingTime, 
            breakTime: formattedBreakTime, 
            age,
            experience,
            checkUpTime,
            workOn,
            phoneNumber,
            email,
            city,
            state,
            country,
            doctorAddress,
            zipCode,
            description,
            hospital,
            currentHospital,
            hospitalWebsiteLink,
            emergencyPhoneNumber,
            hospitalAddress,
            onlineConsultationRate,
            password: hashedPassword,
            profileImage: profileImageResult.secure_url,
            signatureImage: signatureImageResult.secure_url,
            profilePublicId: profileImageResult.public_id,
            signaturePublicId: signatureImageResult.public_id
        });

        await newDoctor.save();

        res.status(201).json({ message: "Doctor registered successfully.", newDoctor });
    } catch (error) {
        console.error('Error during doctor registration:', error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};


// Login Doctor
exports.loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = await Doctor.findOne({ email });


        if (!doctor) {
            return res.status(400).json({ message: "Doctor not found." });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, doctorId: doctor._id });
    } catch (error) {
        res.status(500).json({ message: "Error logging in doctor.", error });
    }
};

// Get Doctors
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching doctors.", error });
    }
};

// Update Doctor
exports.updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        const updatedData = { ...req.body };

        if (req.files) {
            const { profileImage, signatureImage } = req.files;

            if (doctor.profilePublicId) {
                await cloudinary.uploader.destroy(doctor.profilePublicId);
            }
            if (doctor.signaturePublicId) {
                await cloudinary.uploader.destroy(doctor.signaturePublicId);
            }

            if (profileImage) {
                const profileResult = await cloudinary.uploader.upload(profileImage.tempFilePath, { folder: "doctors" });
                updatedData.profileImage = profileResult.secure_url;
                updatedData.profilePublicId = profileResult.public_id;
            }

            if (signatureImage) {
                const signatureResult = await cloudinary.uploader.upload(signatureImage.tempFilePath, { folder: "doctors" });
                updatedData.signatureImage = signatureResult.secure_url;
                updatedData.signaturePublicId = signatureResult.public_id;
            }
        }
        if (updatedData.password) {
            updatedData.password = doctor.password
        }
        const updatedDoctor = await Doctor.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json(updatedDoctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating doctor.", error });
    }
};

// Delete Doctor
exports.deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        if (doctor.profilePublicId) {
            await cloudinary.uploader.destroy(doctor.profilePublicId);
        }
        if (doctor.signaturePublicId) {
            await cloudinary.uploader.destroy(doctor.signaturePublicId);
        }

        await Doctor.findByIdAndDelete(id);
        res.status(200).json({ message: "Doctor deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting doctor.", error });
    }
};


// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, doctor.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        doctor.password = hashedPassword;
        await doctor.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error changing password.", error });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email, phoneNumber } = req.body;
    let user;

    if (email) {
        user = await Doctor.findOne({ email });
    } else if (phoneNumber) {
        user = await Doctor.findOne({ phoneNumber });
    }

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otps[user._id] = { otp, expires: Date.now() + parseInt(process.env.OTP_EXPIRATION) };

    await sendEmail(user.email, 'Password Reset OTP', `Your OTP is: ${otp}`);

    res.status(200).json({ message: 'OTP sent' });
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;

    if (!otps[userId] || otps[userId].otp !== otp || Date.now() > otps[userId].expires) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    delete otps[userId];
    res.status(200).json({ message: 'OTP verified', userId });
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    const doctor = await Doctor.findById(userId);
    if (!doctor) {
        return res.status(400).json({ message: 'User not found' });
    }

    doctor.password = await bcrypt.hash(newPassword, 10);
    await doctor.save();

    res.status(200).json({ message: 'Password has been reset' });
};

exports.getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.doctor._id;

        const appointments = await Appointment.find({ doctorId })
            .populate('patientId', 'firstName lastName')
            .populate('doctorId', 'name specialty');

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this doctor' });
        }


        const appointmentsWithFullNames = appointments.map(appointment => {
            const fullName = `${appointment.patientId.firstName} ${appointment.patientId.lastName}`;
            return {
                ...appointment.toObject(),
                patientFullName: fullName
            };
        });


        res.status(200).json(appointmentsWithFullNames);
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        res.status(500).json({ message: 'Error fetching doctor appointments', error });
    }
};
