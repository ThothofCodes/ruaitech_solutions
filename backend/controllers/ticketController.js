const { emitTicketReply } = require('../socket');
// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');
const Ticket   = require('../models/Ticket');
const { sendSMS } = require('../config/africastalking');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const safePage  = (p) => Math.max(1, Math.min(Number(p) || 1, 1000));
const safeLimit = (l) => Math.max(1, Math.min(Number(l) || 20, 100));

exports.createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });
    const isClient = req.user.role === 'CLIENT';
    const ticket = await Ticket.create({
      department:     req.user.department?._id || req.user.department,
      departmentSlug: req.user.departmentSlug,
      raisedBy:       req.user._id,
      raisedByRole:   isClient ? 'CLIENT' : 'STAFF',
      title:          title.trim().slice(0,200),
      description:    description.trim().slice(0,5000),
      category:       category || 'General',
      priority:       priority || 'MEDIUM',
    });
    res.status(201).json(ticket);
  } catch (err) { next(err); }
};

exports.getTickets = async (req, res, next) => {
  try {
    const page = safePage(req.query.page), limit = safeLimit(req.query.limit);
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { departmentSlug: req.user.departmentSlug };
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.slaBreach === 'true') filter.slaBreach = true;
    const [tickets, total] = await Promise.all([
      Ticket.find(filter).populate('assignedTo','name').sort('-createdAt').skip((page-1)*limit).limit(limit),
      Ticket.countDocuments(filter),
    ]);
    res.json({ tickets, total, page });
  } catch (err) { next(err); }
};

exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ raisedBy: req.user._id }).sort('-createdAt').limit(50);
    res.json(tickets);
  } catch (err) { next(err); }
};

exports.getTicket = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const ticket = await Ticket.findById(req.params.id).populate('assignedTo','name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) { next(err); }
};

exports.assignTicket = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const { staffId } = req.body;
    if (!isValidId(staffId)) return res.status(400).json({ message: 'Invalid staff ID' });
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { assignedTo: staffId, status: 'IN_PROGRESS' }, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) { next(err); }
};

exports.replyTicket = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $push: { thread: { author: req.user._id, authorRole: req.user.role, message: message.slice(0,5000) } } },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    // Real-time: push reply to ticket watchers
    try {
      const { emitTicketReply } = require('../socket');
      const entry = ticket?.thread?.[ticket.thread.length - 1];
      if (entry) emitTicketReply(String(ticket._id), entry);
    } catch (_) {}
    res.json(ticket);
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const VALID = ['OPEN','IN_PROGRESS','AWAITING_CLIENT','RESOLVED','CLOSED','REOPENED'];
    if (!VALID.includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
    const update = { status: req.body.status };
    if (req.body.status === 'RESOLVED') update.resolvedAt = new Date();
    if (req.body.status === 'CLOSED')   update.closedAt   = new Date();
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) { next(err); }
};

exports.escalateTicket = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'codeofthoth@outlook.com';
    const User = require('../models/User');
    const superAdmin = await User.findOne({ email: superAdminEmail });
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'ESCALATED', escalatedTo: superAdmin?._id },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) { next(err); }
};

exports.rateTicket = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const score = Number(req.body.score);
    if (!score || score < 1 || score > 5) return res.status(400).json({ message: 'Score must be 1–5' });
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { satisfactionScore: score }, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) { next(err); }
};

exports.getEscalated = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ status: 'ESCALATED' }).populate('department','name slug').sort('-createdAt');
    res.json(tickets);
  } catch (err) { next(err); }
};
