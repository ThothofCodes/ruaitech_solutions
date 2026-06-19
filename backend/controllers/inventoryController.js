// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');
const { InventoryItem, StockMovement } = require('../models/Inventory');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const safePage  = (p) => Math.max(1, Math.min(Number(p) || 1, 1000));
const safeLimit = (l) => Math.max(1, Math.min(Number(l) || 20, 100));
const VALID_MOVE = ['RESTOCK','SALE','JOB_USAGE','DAMAGE_LOSS','RETURN','TRANSFER','ADJUSTMENT'];

exports.getItems = async (req, res, next) => {
  try {
    const page = safePage(req.query.page), limit = safeLimit(req.query.limit);
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { departmentSlug: req.user.departmentSlug };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const s = req.query.search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').slice(0,100);
      filter.name = new RegExp(s,'i');
    }
    const [items, total] = await Promise.all([
      InventoryItem.find(filter).sort('name').skip((page-1)*limit).limit(limit),
      mongoose.connection.readyState === 1
        ? InventoryItem.countDocuments(filter)
        : Promise.resolve(0),
    ]);
    res.json({ items, total, page });
  } catch (err) { next(err); }
};

exports.createItem = async (req, res, next) => {
  try {
    const { name, category, sku, quantity, reorderLevel, reorderQty, unitCost, sellingPrice, supplier, supplierContact, location, condition, warrantyMonths, expiryDate } = req.body;
    if (!name || !category) return res.status(400).json({ message: 'Name and category required' });
    const item = await InventoryItem.create({
      department:     req.user.department?._id || req.user.department,
      departmentSlug: req.user.departmentSlug,
      name: name.trim().slice(0,200), category,
      sku, quantity: Math.max(0, Number(quantity) || 0),
      reorderLevel: Number(reorderLevel) || 5,
      reorderQty:   Number(reorderQty)   || 10,
      unitCost:     Number(unitCost)     || 0,
      sellingPrice: Number(sellingPrice) || 0,
      supplier, supplierContact, location,
      condition: condition || 'NEW',
      warrantyMonths: warrantyMonths ? Number(warrantyMonths) : undefined,
      expiryDate:     expiryDate ? new Date(expiryDate) : undefined,
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) { next(err); }
};

exports.recordMovement = async (req, res, next) => {
  try {
    const { itemId, type, quantity, reference, notes } = req.body;
    if (!isValidId(itemId)) return res.status(400).json({ message: 'Invalid item ID' });
    if (!VALID_MOVE.includes(type)) return res.status(400).json({ message: 'Invalid movement type' });
    const qty = Math.abs(Math.floor(Number(quantity)));
    if (!qty) return res.status(400).json({ message: 'Valid quantity required' });

    const item = await InventoryItem.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const prevQty = item.quantity;
    const delta   = ['RESTOCK','RETURN','ADJUSTMENT'].includes(type) ? qty : -qty;
    const newQty  = Math.max(0, prevQty + delta);

    item.quantity = newQty;
    if (type === 'RESTOCK') item.lastRestockedAt = new Date();
    await item.save();

    await StockMovement.create({
      item: itemId, department: item.department,
      type, quantity: delta, previousQty: prevQty, newQty,
      reference, notes, performedBy: req.user._id,
    });

    res.json({ item, movement: { type, delta, previousQty: prevQty, newQty } });
  } catch (err) { next(err); }
};

exports.getMovements = async (req, res, next) => {
  try {
    if (!isValidId(req.params.itemId)) return res.status(400).json({ message: 'Invalid item ID' });
    const movements = await StockMovement.find({ item: req.params.itemId }).sort('-createdAt').limit(100);
    res.json(movements);
  } catch (err) { next(err); }
};

exports.getLowStock = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { departmentSlug: req.user.departmentSlug };
    const items = await InventoryItem.find({ ...filter, $expr: { $lte: ['$quantity', '$reorderLevel'] } }).sort('quantity');
    res.json(items);
  } catch (err) { next(err); }
};

exports.getExpiring = async (req, res, next) => {
  try {
    const days   = Number(req.query.days) || 30;
    const cutoff = new Date(Date.now() + days * 86400000);
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { departmentSlug: req.user.departmentSlug };
    const items  = await InventoryItem.find({ ...filter, expiryDate: { $lte: cutoff, $gte: new Date() } }).sort('expiryDate');
    res.json(items);
  } catch (err) { next(err); }
};

exports.getMasterView = async (req, res, next) => {
  try {
    const summary = await InventoryItem.aggregate([
      { $group: { _id: '$departmentSlug', totalItems: { $sum: 1 }, totalValue: { $sum: { $multiply: ['$quantity','$unitCost'] } }, lowStockCount: { $sum: { $cond: [{ $lte: ['$quantity','$reorderLevel'] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(summary);
  } catch (err) { next(err); }
};
