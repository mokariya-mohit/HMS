const twilio = require('twilio');
const VideoCall = require('../models/VideoCall');
const { AccessToken } = require('twilio').jwt;
const VideoGrant = AccessToken.VideoGrant;

// Initialize Twilio with both API Key and Account SID
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

const twilioClient = twilio(apiKeySid, apiKeySecret, { accountSid });

exports.createVideoCall = async (req, res) => {
    const { doctorId, patientId } = req.body;

    try {
        const room = await twilioClient.video.rooms.create({ uniqueName: `room-${Date.now()}` });

        const videoCall = new VideoCall({
            doctorId,
            patientId,
            roomName: room.sid,
        });
        await videoCall.save();

        res.status(200).json({ success: true, roomName: room.sid });
    } catch (error) {
        console.error('Error creating video call:', error);
        res.status(500).json({ success: false, error: 'Failed to create video call' });
    }
};

// Generate Access Token
exports.generateAccessToken = (req, res) => {
    const { roomName, identity } = req.body; // Make sure identity is retrieved from the request body

    if (!roomName || !identity) {
        return res.status(400).json({ success: false, message: 'roomName and identity are required' });
    }

    // Create a new Access Token with identity
    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
        { identity } // Set identity here
    );

    // Add Video Grant
    const videoGrant = new VideoGrant({ room: roomName });
    token.addGrant(videoGrant);

    // Return the token
    res.status(200).json({ success: true, token: token.toJwt() });
};


// Get the video call details
exports.getVideoCall = async (req, res) => {
    const { doctorId, patientId } = req.params;

    try {
        const videoCall = await VideoCall.findOne({ doctorId, patientId });

        if (!videoCall) {
            return res.status(404).json({ success: false, message: 'No video call found' });
        }

        res.status(200).json({ success: true, videoCall });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch video call' });
    }
};
