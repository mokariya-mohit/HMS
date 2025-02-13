const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require('../utils/cloudinaryConfig');
const crypto = require('crypto');
let otps = {};

// Register Admin
exports.registerAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, hospital, country, state, city, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: "Image is required." });
        }

        const imageFile = req.files.image;

        const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
            folder: 'admins',
        });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            firstName,
            lastName,
            email,
            hospital,
            phoneNumber,
            image: result.secure_url,
            imagePublicId: result.public_id,
            country,
            state,
            city,
            password: hashedPassword,
        });

        await newAdmin.save();
        res.status(201).json({ message: "Admin registered successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering admin.", error: error.message });
    }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json({ message: "Admin not found." });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, adminId: admin._id });
    } catch (error) {
        res.status(500).json({ message: "Error logging in admin.", error });
    }
};

// Get Admins
exports.getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admins.", error });
    }
};

// Update Admin
exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;

        const existingAdmin = await Admin.findById(id);
        if (!existingAdmin) {
            return res.status(404).json({ message: "Admin not found." });
        }


        if (req.files.image) {
            const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
                folder: "admins",
            });
            await cloudinary.uploader.destroy(existingAdmin.imagePublicId);

            updateFields.image = result.secure_url;
            updateFields.imagePublicId = result.public_id;
        }
        if (updateFields.password) {
            updateFields.password = existingAdmin.password
        }
        const updatedAdmin = await Admin.findByIdAndUpdate(id, updateFields, { new: true });
        res.status(200).json(updatedAdmin);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating admin.", error });
    }
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }
        await cloudinary.uploader.destroy(admin.imagePublicId);
        await Admin.findByIdAndDelete(id);
        res.status(200).json({ message: "Admin deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting admin.", error });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        admin.password = hashedPassword;
        await admin.save();

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
        user = await Admin.findOne({ email });
    } else if (phoneNumber) {
        user = await Admin.findOne({ phoneNumber });
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

    const admin = await Admin.findById(userId);
    if (!admin) {
        return res.status(400).json({ message: 'User not found' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({ message: 'Password has been reset' });
};
