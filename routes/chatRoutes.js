const express = require('express');
const { sendMessage, getConversation } = require('../controllers/chatController');
const { authenticateUser } = require('../middlewares/authMiddleware');

const router = express.Router();


// Route to send a message
router.post('/send',authenticateUser, sendMessage);

// Route to get the conversation between doctor and patient
router.get('/conversation/:doctorId/:patientId',authenticateUser, getConversation);

module.exports = router;
