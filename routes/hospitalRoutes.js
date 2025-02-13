const express = require('express');
const { createHospital, getAllHospitals, updateHospital, deleteHospital } = require('../controllers/hospitalController');
const router = express.Router();
const { isAdmin } = require('../middlewares/authMiddleware');

router.post('/', isAdmin, createHospital);
router.get('/', getAllHospitals);
router.put('/:id', updateHospital);
router.delete('/:id', deleteHospital);

module.exports = router;
