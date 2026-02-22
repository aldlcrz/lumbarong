const Message = require('../models/Message');
const User = require('../models/User');
const { Op } = require('sequelize');

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.userId || req.user.id;

        if (!receiverId || !content) {
            console.error('Missing receiverId or content in chat/send', { receiverId, content, reqBody: req.body });
            return res.status(400).json({ message: 'Receiver and content are required', received: { receiverId, content } });
        }

        const message = await Message.create({
            senderId,
            receiverId,
            content
        });

        // Populate sender info
        const populatedMessage = await Message.findByPk(message.id, {
            include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'profileImage'] }]
        });

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
};

// Get conversation with a specific user
exports.getConversation = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { otherUserId } = req.params;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            order: [['createdAt', 'ASC']],
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'profileImage', 'shopName'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'profileImage', 'shopName'] }
            ]
        });

        // Mark as read
        await Message.update(
            { isRead: true },
            {
                where: {
                    senderId: otherUserId,
                    receiverId: userId,
                    isRead: false
                }
            }
        );

        res.json(messages);
    } catch (error) {
        console.error('Fetch Conversation Error:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

// Get all recent conversations for the logged-in user
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [{ senderId: userId }, { receiverId: userId }]
            },
            order: [['createdAt', 'DESC']]
        });

        const chattedUserIds = new Set();
        messages.forEach(msg => {
            if (msg.senderId !== userId) chattedUserIds.add(msg.senderId);
            if (msg.receiverId !== userId) chattedUserIds.add(msg.receiverId);
        });

        const conversations = await Promise.all(Array.from(chattedUserIds).map(async (otherId) => {
            const lastMessage = await Message.findOne({
                where: {
                    [Op.or]: [
                        { senderId: userId, receiverId: otherId },
                        { senderId: otherId, receiverId: userId }
                    ]
                },
                order: [['createdAt', 'DESC']],
                include: [
                    { model: User, as: 'sender', attributes: ['id', 'name', 'shopName', 'profileImage'] },
                    { model: User, as: 'receiver', attributes: ['id', 'name', 'shopName', 'profileImage'] }
                ]
            });

            const unreadCount = await Message.count({
                where: {
                    senderId: otherId,
                    receiverId: userId,
                    isRead: false
                }
            });

            const msgObj = lastMessage ? lastMessage.toJSON() : null;
            if (!msgObj) return null;

            const isSender = msgObj.senderId === userId;
            const otherUserValues = isSender ? msgObj.receiver : msgObj.sender;
            const otherUserId = isSender ? msgObj.receiverId : msgObj.senderId;

            return {
                otherUser: {
                    id: otherUserId,
                    name: otherUserValues ? otherUserValues.name : null,
                    shopName: otherUserValues ? otherUserValues.shopName : null,
                    profileImage: otherUserValues ? otherUserValues.profileImage : null
                },
                lastMessage: msgObj.content,
                timestamp: msgObj.createdAt,
                unreadCount
            };
        }));

        res.json(conversations.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
        console.error('Fetch Conversations Error:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};
