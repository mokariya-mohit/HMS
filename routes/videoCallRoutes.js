const express = require('express');
const { createVideoCall, generateAccessToken, getVideoCall } = require('../controllers/videoCallController');

const router = express.Router();

router.post('/create', createVideoCall);
router.post('/token', generateAccessToken); // New route for generating tokens
router.get('/:doctorId/:patientId', getVideoCall);


module.exports = router;
