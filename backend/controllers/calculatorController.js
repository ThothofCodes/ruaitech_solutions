// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose    = require('mongoose');
const PricingRule = require('../models/PricingRule');

const isValidId  = (id) => mongoose.Types.ObjectId.isValid(id);
const VALID_TIERS = ['basic','standard','premium'];

const SEED_RULES = [
  { service:'Website Design', tier:'basic', price:15000, rushMultiplier:1.30 },
  { service:'Website Design', tier:'standard', price:25000, rushMultiplier:1.30 },
  { service:'Website Design', tier:'premium', price:45000, rushMultiplier:1.30 },
  { service:'MERN Web Application', tier:'basic', price:40000, rushMultiplier:1.40 },
  { service:'MERN Web Application', tier:'standard', price:80000, rushMultiplier:1.40 },
  { service:'MERN Web Application', tier:'premium', price:150000, rushMultiplier:1.40 },
  { service:'E-Commerce Store', tier:'basic', price:35000, rushMultiplier:1.35 },
  { service:'E-Commerce Store', tier:'standard', price:65000, rushMultiplier:1.35 },
  { service:'E-Commerce Store', tier:'premium', price:120000, rushMultiplier:1.35 },
  { service:'Cybersecurity Audit', tier:'basic', price:5000, rushMultiplier:1.25 },
  { service:'Cybersecurity Audit', tier:'standard', price:12000, rushMultiplier:1.25 },
  { service:'Cybersecurity Audit', tier:'premium', price:25000, rushMultiplier:1.25 },
  { service:'Hardware Repair', tier:'basic', price:500, rushMultiplier:1.20 },
  { service:'Hardware Repair', tier:'standard', price:1500, rushMultiplier:1.20 },
  { service:'Hardware Repair', tier:'premium', price:3500, rushMultiplier:1.20 },
  { service:'IT Support Monthly', tier:'basic', price:8000, rushMultiplier:1.0 },
  { service:'IT Support Monthly', tier:'standard', price:15000, rushMultiplier:1.0 },
  { service:'IT Support Monthly', tier:'premium', price:30000, rushMultiplier:1.0 },
  { service:'Social Media Management', tier:'basic', price:6000, rushMultiplier:1.0 },
  { service:'Social Media Management', tier:'standard', price:12000, rushMultiplier:1.0 },
  { service:'Social Media Management', tier:'premium', price:22000, rushMultiplier:1.0 },
  { service:'Domain + Hosting Annual', tier:'basic', price:3000, rushMultiplier:1.0 },
  { service:'Domain + Hosting Annual', tier:'standard', price:6000, rushMultiplier:1.0 },
  { service:'Domain + Hosting Annual', tier:'premium', price:12000, rushMultiplier:1.0 },
];

exports.getPricingRules = async (req, res, next) => {
  try {
    const rules = await PricingRule.find({ isActive: true }).sort('service tier');
    res.json(rules);
  } catch (err) { next(err); }
};

exports.getEstimate = async (req, res, next) => {
  try {
    const { service, tier, isRush } = req.body;
    if (!service || typeof service !== 'string' || service.length > 100) return res.status(400).json({ message: 'Valid service name required' });
    if (!VALID_TIERS.includes(tier)) return res.status(400).json({ message: 'Tier must be basic, standard, or premium' });
    const rule = await PricingRule.findOne({ service: service.trim(), tier, isActive: true });
    if (!rule) return res.status(404).json({ message: 'No pricing rule found for this service and tier' });
    const price = isRush ? Math.round(rule.price * rule.rushMultiplier) : rule.price;
    res.json({ service: rule.service, tier, basePrice: rule.price, finalPrice: price, isRush: !!isRush, rushMultiplier: rule.rushMultiplier });
  } catch (err) { next(err); }
};

exports.updatePricingRule = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid rule ID' });
    const { price, rushMultiplier } = req.body;
    const parsedPrice = Number(price);
    const parsedMult  = Number(rushMultiplier);
    if (!parsedPrice || parsedPrice < 0 || parsedPrice > 10_000_000) return res.status(400).json({ message: 'Valid price required' });
    if (!parsedMult || parsedMult < 1 || parsedMult > 5) return res.status(400).json({ message: 'Rush multiplier must be between 1 and 5' });
    const rule = await PricingRule.findByIdAndUpdate(
      req.params.id,
      { price: parsedPrice, rushMultiplier: parsedMult, lastUpdatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json(rule);
  } catch (err) { next(err); }
};

exports.seedPricingRules = async (req, res, next) => {
  try {
    await PricingRule.deleteMany({});
    const rules = await PricingRule.insertMany(SEED_RULES);
    res.status(201).json({ message: `${rules.length} pricing rules seeded` });
  } catch (err) { next(err); }
};
