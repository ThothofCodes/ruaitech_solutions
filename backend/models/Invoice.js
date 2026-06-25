// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true },
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentSlug: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'CRMClient', required: true },
  serviceRef: { type: mongoose.Schema.Types.ObjectId, default: null },
  lineItems: [LineItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0.16 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'KES' },
  status: { type: String, enum: ['DRAFT', 'SENT', 'PAYMENT_SENT', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'], default: 'DRAFT' },
  dueDate: { type: Date, required: true },
  mpesaRef: String,
  checkoutRequestId: String,
  receiptUrl: String,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: Date,
}, { timestamps: true });

InvoiceSchema.pre('save', async function (next) {
  if (!this.invoiceId) {
    const count = await mongoose.model('Invoice').countDocuments({ departmentSlug: this.departmentSlug });
    const slug = this.departmentSlug.toUpperCase().slice(0, 3);
    this.invoiceId = `RTS-${slug}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
  this.balance = this.totalAmount - this.amountPaid;
  next();
});

InvoiceSchema.index({ department: 1, status: 1 });
InvoiceSchema.index({ client: 1, status: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
