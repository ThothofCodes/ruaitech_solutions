// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 120 },
  slug: { type: String, unique: true, lowercase: true },
  category: { type: String, enum: ['electronics', 'accessories', 'software', 'services'], required: true },
  description: { type: String, required: true, maxlength: 2000 },
  shortDesc: { type: String, maxlength: 200 },
  price: { type: Number, required: true, min: 0 },
  comparePrice: Number,
  images: { type: [String], default: [] },
  stock: { type: Number, default: 0, min: 0 },
  isDigital: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  sku: { type: String, sparse: true, unique: true },
  warranty: { type: String, default: 'No warranty' },
}, { timestamps: true });

ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
