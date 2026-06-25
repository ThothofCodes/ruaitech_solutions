// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');
const Client = require('../models/Client');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const safePage = (p) => Math.max(1, Math.min(Number(p) || 1, 1000));
const safeLimit = (l) => Math.max(1, Math.min(Number(l) || 20, 100));
const VALID_TYPES = ['individual', 'sme', 'institution', 'ngo'];

exports.getClients = async (req, res, next) => {
  try {
    const page = safePage(req.query.page); const
      limit = safeLimit(req.query.limit);
    const query = {};
    if (req.query.search) {
      const safe = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
      query.$or = [{ name: new RegExp(safe, 'i') }, { phone: new RegExp(safe, 'i') }];
    }
    if (req.query.clientType && VALID_TYPES.includes(req.query.clientType)) query.clientType = req.query.clientType;
    const [clients, total] = await Promise.all([
      Client.find(query).sort('-createdAt').skip((page - 1) * limit).limit(limit),
      mongoose.connection.readyState === 1 ? Client.countDocuments(query) : Promise.resolve(0),
    ]);
    res.json({
      clients, total, page, pages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
};

exports.getClient = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid client ID' });
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) { next(err); }
};

exports.createClient = async (req, res, next) => {
  try {
    const {
      name, phone, email, clientType, notes,
    } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) return res.status(400).json({ message: 'Valid name required' });
    if (!phone || typeof phone !== 'string') return res.status(400).json({ message: 'Phone required' });
    if (clientType && !VALID_TYPES.includes(clientType)) return res.status(400).json({ message: 'Invalid client type' });
    const client = await Client.create({
      name: name.trim().slice(0, 100),
      phone: phone.replace(/\D/g, '').slice(0, 15),
      email: email?.toLowerCase().trim().slice(0, 200),
      clientType: clientType || 'individual',
      notes: notes?.trim().slice(0, 1000),
    });
    res.status(201).json(client);
  } catch (err) { next(err); }
};

exports.updateClient = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid client ID' });
    const {
      name, phone, email, clientType, notes,
    } = req.body;
    if (clientType && !VALID_TYPES.includes(clientType)) return res.status(400).json({ message: 'Invalid client type' });
    const update = {};
    if (name) update.name = name.trim().slice(0, 100);
    if (phone) update.phone = phone.replace(/\D/g, '').slice(0, 15);
    if (email) update.email = email.toLowerCase().trim().slice(0, 200);
    if (clientType) update.clientType = clientType;
    if (notes !== undefined) update.notes = notes.trim().slice(0, 1000);
    const client = await Client.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) { next(err); }
};

exports.deleteClient = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid client ID' });
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted' });
  } catch (err) { next(err); }
};
