const Hospital = require('../models/Hospital');

// Create a new hospital
const createHospital = async (req, res) => {
    try {
        const hospital = new Hospital(req.body);
        await hospital.save();
        res.status(201).json({ message: 'Hospital created successfully', hospital });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all hospitals
const getAllHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.status(200).json(hospitals);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get hospital by ID
const getHospitalById = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        res.status(200).json(hospital);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update hospital by ID
const updateHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        res.status(200).json({ message: 'Hospital updated successfully', hospital });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete hospital by ID
const deleteHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        res.status(200).json({ message: 'Hospital deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createHospital,
    getAllHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
};
