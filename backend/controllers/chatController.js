// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const ChatMessage = require('../models/ChatMessage');
const CallbackRequest = require('../models/CallbackRequest');
const { getIO } = require('../socket');
const { presenceManager } = require('../socket/presence.manager');

const chatController = {
  // Create a callback request
  createCallbackRequest: async (req, res) => {
    try {
      const { clientName, message, phone } = req.body;
      
      if (!clientName || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Client name and message are required' 
        });
      }

      const callbackRequest = new CallbackRequest({
        clientName,
        message,
        phone,
        status: 'pending'
      });

      await callbackRequest.save();

      // Notify all connected admins about the new callback request
      const io = getIO();
      io.to('admin-room').emit('new-callback-request', {
        id: callbackRequest._id,
        clientName,
        message,
        phone,
        createdAt: callbackRequest.createdAt
      });

      res.status(201).json({
        success: true,
        data: callbackRequest
      });
    } catch (error) {
      console.error('Error creating callback request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create callback request'
      });
    }
  },

  // Get all conversations
  getAllConversations: async (req, res) => {
    try {
      // Get all conversations from the past 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const conversations = await ChatMessage.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: '$conversationId',
            guestId: { $first: '$senderId' },
            lastMessage: { $last: '$message' },
            timestamp: { $last: '$createdAt' },
            messageCount: { $sum: 1 },
            unreadCount: {
              $sum: {
                $cond: [
                  { $eq: ['$read', false] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $sort: { timestamp: -1 }
        }
      ]);

      res.json({
        success: true,
        data: conversations
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get conversations'
      });
    }
  },

  // Get a specific conversation
  getConversation: async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      const messages = await ChatMessage.find({ 
        conversationId 
      }).sort({ createdAt: 1 });

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Error getting conversation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get conversation'
      });
    }
  },

  // Mark conversation as read
  markAsRead: async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      await ChatMessage.updateMany(
        { conversationId },
        { read: true, readAt: new Date() }
      );

      res.json({
        success: true,
        message: 'Conversation marked as read'
      });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark conversation as read'
      });
    }
  },

  // Get callback requests
  getCallbackRequests: async (req, res) => {
    try {
      const { status } = req.query;
      
      const filter = {};
      if (status) {
        filter.status = status;
      }

      const callbackRequests = await CallbackRequest.find(filter)
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: callbackRequests
      });
    } catch (error) {
      console.error('Error getting callback requests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get callback requests'
      });
    }
  },

  // Update callback request
  updateCallbackRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (notes) updateData.notes = notes;

      const callbackRequest = await CallbackRequest.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!callbackRequest) {
        return res.status(404).json({
          success: false,
          error: 'Callback request not found'
        });
      }

      res.json({
        success: true,
        data: callbackRequest
      });
    } catch (error) {
      console.error('Error updating callback request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update callback request'
      });
    }
  },

  // Get admin status
  getAdminStatus: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get the specific admin's availability setting
      const adminAvailability = presenceManager.getAdminAvailability(userId);
      
      // Get overall system admin online status
      const systemAdminOnline = presenceManager.isAnyAdminOnline();
      
      res.json({
        success: true,
        status: adminAvailability, // This admin's willingness to receive chats
        adminOnline: systemAdminOnline, // Overall system availability
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting admin status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get admin status'
      });
    }
  },

  // Update admin status - This controls whether an admin is willing to receive chats
  updateAdminStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const userId = req.user.id;
      
      if (typeof status !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Status must be a boolean value'
        });
      }

      // Update this admin's availability preference
      presenceManager.setAdminAvailability(userId, status);
      
      // Broadcast the updated admin status to all visitors
      const io = getIO();
      io.to('public-chat').emit('admin:status', { online: presenceManager.isAnyAdminOnline() });

      res.json({
        success: true,
        message: status 
          ? 'You are now available to receive customer chats' 
          : 'You are no longer available to receive customer chats',
        status: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update admin status'
      });
    }
  }
};

module.exports = chatController;