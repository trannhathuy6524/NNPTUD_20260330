var express = require("express");
var router = express.Router();
let messagesController = require('../controllers/messages');
let { checkLogin } = require('../utils/authHandler.js');

/**
 * GET / - Lấy tin nhắn cuối cùng của mỗi cuộc trò chuyện
 */
router.get("/", checkLogin, async function (req, res, next) {
    try {
        let userId = req.userId;
        let result = await messagesController.getLastMessages(userId);
        res.send({
            success: true,
            data: result,
            message: "Lấy tin nhắn cuối cùng thành công"
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Lỗi khi lấy tin nhắn",
            error: error.message
        });
    }
});

/**
 * POST / - Gửi tin nhắn mới
 * Body: {
 *   "to": "userID",
 *   "messageContent": {
 *     "type": "file|text",
 *     "text": "content hoặc path"
 *   }
 * }
 */
router.post("/", checkLogin, async function (req, res, next) {
    try {
        const fromUserId = req.userId;
        const { to, messageContent } = req.body;

        // Validation
        if (!to) {
            return res.status(400).send({
                success: false,
                message: "Vui lòng cung cấp userID người nhận"
            });
        }

        if (!messageContent) {
            return res.status(400).send({
                success: false,
                message: "Vui lòng cung cấp nội dung tin nhắn"
            });
        }

        if (!messageContent.type || !['file', 'text'].includes(messageContent.type)) {
            return res.status(400).send({
                success: false,
                message: "Type phải là 'file' hoặc 'text'"
            });
        }

        if (!messageContent.text) {
            return res.status(400).send({
                success: false,
                message: "Vui lòng cung cấp nội dung (text hoặc đường dẫn file)"
            });
        }

        // Gửi tin nhắn
        const newMessage = await messagesController.sendMessage(
            fromUserId,
            to,
            messageContent
        );

        res.send({
            success: true,
            data: newMessage,
            message: "Gửi tin nhắn thành công"
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Lỗi khi gửi tin nhắn",
            error: error.message
        });
    }
});

/**
 * GET /:userID - Lấy tất cả tin nhắn giữa user hiện tại và userID cụ thể
 */
router.get("/:userID", checkLogin, async function (req, res, next) {
    try {
        const currentUserId = req.userId;
        const otherUserId = req.params.userID;

        if (!otherUserId) {
            return res.status(400).send({
                success: false,
                message: "Vui lòng cung cấp userID"
            });
        }

        const messages = await messagesController.getConversation(
            currentUserId,
            otherUserId
        );

        res.send({
            success: true,
            data: messages,
            message: "Lấy cuộc trò chuyện thành công"
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Lỗi khi lấy cuộc trò chuyện",
            error: error.message
        });
    }
});

module.exports = router;
