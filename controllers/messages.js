let messageModel = require('../schemas/messages');

module.exports = {
    /**
     * Lấy toàn bộ tin nhắn giữa 2 user
     * @param {String} fromUserId - User hiện tại
     * @param {String} toUserId - User đối tác
     * @returns {Array} Mảng tin nhắn
     */
    getConversation: async function (fromUserId, toUserId) {
        try {
            const messages = await messageModel.find({
                $or: [
                    { from: fromUserId, to: toUserId },
                    { from: toUserId, to: fromUserId }
                ]
            }).sort({ createdAt: 1 });
            return messages;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Gửi tin nhắn mới
     * @param {String} fromUserId - User gửi
     * @param {String} toUserId - User nhận
     * @param {Object} messageContent - Nội dung tin nhắn {type, text}
     * @returns {Object} Tin nhắn vừa tạo
     */
    sendMessage: async function (fromUserId, toUserId, messageContent) {
        try {
            const newMessage = new messageModel({
                from: fromUserId,
                to: toUserId,
                messageContent: {
                    type: messageContent.type,
                    text: messageContent.text
                }
            });
            await newMessage.save();
            return newMessage;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy tin nhắn cuối cùng của mỗi cuộc trò chuyện
     * @param {String} userId - User hiện tại
     * @returns {Array} Mảng tin nhắn cuối cùng với mỗi user
     */
    getLastMessages: async function (userId) {
        try {
            // Lấy tất cả user mà user hiện tại đã có cuộc trò chuyện
            const messages = await messageModel.aggregate([
                {
                    $match: {
                        $or: [
                            { from: userId },
                            { to: userId }
                        ]
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ['$from', userId] },
                                '$to',
                                '$from'
                            ]
                        },
                        lastMessage: { $first: '$$ROOT' }
                    }
                },
                {
                    $replaceRoot: { newRoot: '$lastMessage' }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ]);
            
            return messages;
        } catch (error) {
            throw error;
        }
    }
};
