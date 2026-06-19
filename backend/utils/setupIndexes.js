// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
// Ensure database indexes are created for performance

const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ChatMessage = require('../models/ChatMessage');
const CallbackRequest = require('../models/CallbackRequest');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');

async function setupIndexes() {
  try {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ departmentSlug: 1 });
    
    // Order indexes
    await Order.collection.createIndex({ 'customer.phone': 1 });
    await Order.collection.createIndex({ status: 1, createdAt: -1 });
    await Order.collection.createIndex({ paymentStatus: 1 });
    
    // Product indexes
    await Product.collection.createIndex({ slug: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ isActive: 1 });
    
    // Chat indexes
    await ChatMessage.collection.createIndex({ conversationId: 1, createdAt: -1 });
    await ChatMessage.collection.createIndex({ senderType: 1 });
    
    // Callback indexes
    await CallbackRequest.collection.createIndex({ status: 1, preferredTime: 1 });
    await CallbackRequest.collection.createIndex({ createdAt: -1 });
    
    // Ticket indexes
    await Ticket.collection.createIndex({ status: 1, createdAt: -1 });
    await Ticket.collection.createIndex({ priority: 1 });
    
    // Booking indexes
    await Booking.collection.createIndex({ status: 1, startTime: -1 });
    await Booking.collection.createIndex({ 'customer.email': 1 });
  } catch (error) {
    // Indexes may already exist
  }
}

module.exports = setupIndexes;
