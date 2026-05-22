import { sendMessageService, getMessagesService } from "../services/chatService.js";

// ================= GET CHAT HISTORY =================
export const getMessages = async (req, res) => {
    try {
        const data = await getMessagesService({
            bookingId:   req.params.bookingId,
            requesterId: req.user.id               
        });
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

// ================= SEND MESSAGE (REST fallback) =================
export const sendMessage = async (req, res) => {
    try {
        const message = await sendMessageService({
            bookingId: req.params.bookingId,
            senderId:  req.user.id,              
            text:      req.body.text
        });
        res.json({ message });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};
