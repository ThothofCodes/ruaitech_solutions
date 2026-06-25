// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const Service = require('../models/Service');

const SEED_SERVICES = [
  {
    name: 'Internet Access (per hour)', category: 'internet', basePrice: 50, priceUnit: 'per hour',
  },
  {
    name: 'Internet Access (daily)', category: 'internet', basePrice: 200, priceUnit: 'per day',
  },
  {
    name: 'Printing (B&W per page)', category: 'printing', basePrice: 10, priceUnit: 'per page',
  },
  {
    name: 'Printing (Colour per page)', category: 'printing', basePrice: 30, priceUnit: 'per page',
  },
  {
    name: 'Gaming (per hour)', category: 'gaming', basePrice: 60, priceUnit: 'per hour',
  },
  {
    name: 'Website Design (Brochure)', category: 'web-dev', basePrice: 15000, priceUnit: 'per project',
  },
  {
    name: 'MERN Web Application', category: 'web-dev', basePrice: 40000, priceUnit: 'per project',
  },
  {
    name: 'Cybersecurity Audit', category: 'cybersecurity', basePrice: 5000, priceUnit: 'per audit',
  },
  {
    name: 'Laptop Repair', category: 'hardware', basePrice: 500, priceUnit: 'per repair',
  },
  {
    name: 'IT Support (monthly)', category: 'it-support', basePrice: 8000, priceUnit: 'per month',
  },
  {
    name: 'Social Media Management', category: 'social-media', basePrice: 6000, priceUnit: 'per month',
  },
];

exports.getServices = async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const services = await Service.find(query).sort('category name');
    res.json(services);
  } catch (err) { next(err); }
};

exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) { next(err); }
};

exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) { next(err); }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) { next(err); }
};

exports.deleteService = async (req, res, next) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) { next(err); }
};

exports.seedServices = async (req, res, next) => {
  try {
    await Service.deleteMany({});
    const services = await Service.insertMany(SEED_SERVICES);
    res.status(201).json({ message: `${services.length} services seeded`, services });
  } catch (err) { next(err); }
};
