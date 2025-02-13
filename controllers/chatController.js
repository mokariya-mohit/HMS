const Chat = require('../models/Chat');
const sendEmail = require('../utils/sendEmail'); // Adjust the path as necessary

exports.sendMessage = async (req, res) => {
    const { doctorId, patientId, message, sender, receiver, doctorEmail, patientEmail } = req.body;

    try {
        let chat = await Chat.findOne({ doctorId, patientId });

        if (!chat) {
            chat = new Chat({ doctorId, patientId, conversation: [] });
        }

        chat.conversation.push({ sender, receiver, message });
        await chat.save();

        const subject = `New Message from ${sender}`;
        const text = `You have received a new message: "${message}"`;

        if (doctorEmail) {
            await sendEmail(doctorEmail, subject, text);
        }

        if (patientEmail) {
            await sendEmail(patientEmail, subject, text);
        }

        res.status(200).json({ success: true, message: 'Message sent successfully', chat });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
};

exports.getConversation = async (req, res) => {
    const { doctorId, patientId } = req.params;

    try {
        const chat = await Chat.findOne({ doctorId, patientId });

        if (!chat) {
            return res.status(404).json({ success: false, message: 'No conversation found' });
        }

        res.status(200).json({ success: true, conversation: chat.conversation });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
    }
};
