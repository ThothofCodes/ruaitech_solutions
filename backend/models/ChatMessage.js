// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  conversationId: { 
    type: String, 
    required: true,
    index: true
  },
  senderId: { 
    type: String, // Could be user ID or guest session ID
    default: null
  },
  senderType: { 
    type: String, 
    enum: ['customer', 'admin', 'system'], 
    default: 'customer' 
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  delivered: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);