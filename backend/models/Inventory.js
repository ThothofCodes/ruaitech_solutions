// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  department:      { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentSlug:  { type: String, required: true },
  name:            { type: String, required: true, trim: true, maxlength: 200 },
  category:        { type: String, required: true },
  sku:             String,
  serialNumbers:   [String],
  quantity:        { type: Number, default: 0, min: 0 },
  reorderLevel:    { type: Number, default: 5 },
  reorderQty:      { type: Number, default: 10 },
  unitCost:        { type: Number, default: 0, min: 0 },
  sellingPrice:    { type: Number, default: 0, min: 0 },
  supplier:        String,
  supplierContact: String,
  location:        String,
  condition:       { type: String, enum: ['NEW','GOOD','FAIR','DAMAGED','SCRAPPED'], default: 'NEW' },
  warrantyMonths:  Number,
  expiryDate:      Date,
  assignedTo:      { type: mongoose.Schema.Types.ObjectId, default: null },
  lastRestockedAt: Date,
  attachments:     [String], // Array of image URLs for hardware repair documentation
}, { timestamps: true });

InventoryItemSchema.index({ department: 1, category: 1 });
InventoryItemSchema.index({ departmentSlug: 1, quantity: 1 });

const StockMovementSchema = new mongoose.Schema({
  item:           { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  department:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  type:           { type: String, enum: ['RESTOCK','SALE','JOB_USAGE','DAMAGE_LOSS','RETURN','TRANSFER','ADJUSTMENT'], required: true },
  quantity:       { type: Number, required: true },
  previousQty:    { type: Number, required: true },
  newQty:         { type: Number, required: true },
  reference:      String,
  notes:          String,
  performedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = {
  InventoryItem:  mongoose.model('InventoryItem', InventoryItemSchema),
  StockMovement:  mongoose.model('StockMovement', StockMovementSchema),
};