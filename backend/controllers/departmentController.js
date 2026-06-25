const mongoose = require('mongoose');
// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const Department = require('../models/Department');

const DEPT_SEED = [
  { name: 'Internet Distribution', slug: 'internet', description: 'ISP packages, hotspot sessions, network management' },
  { name: 'Web Development', slug: 'webdev', description: 'Website design, web apps, retainer contracts' },
  { name: 'PlayStation Arena', slug: 'playstation', description: 'Gaming sessions, tournaments, console management' },
  { name: 'Hardware Repair', slug: 'repair', description: 'Device repairs, job cards, parts inventory' },
  { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Security audits, contracts, incident management' },
  { name: 'Gov Admin Assistance', slug: 'govadmin', description: 'e-Citizen, KRA, NTSA, document processing' },
];

exports.getDepartments = async (req, res, next) => {
  try {
    const depts = await Department.find({ isActive: true }).sort('name');
    res.json(depts);
  } catch (err) { next(err); }
};

exports.getDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findOne({ slug: req.params.slug });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (err) { next(err); }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true },
    );
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (err) { next(err); }
};

exports.setMonthlyTarget = async (req, res, next) => {
  try {
    const { month, target } = req.body; // month: 'YYYY-MM'
    const dept = await Department.findOne({ slug: req.params.slug });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const existing = dept.monthlyTargets.find((t) => t.month === month);
    if (existing) existing.target = target;
    else dept.monthlyTargets.push({ month, target });
    await dept.save();
    res.json(dept);
  } catch (err) { next(err); }
};

exports.seedDepartments = async (req, res, next) => {
  try {
    for (const d of DEPT_SEED) {
      await Department.findOneAndUpdate({ slug: d.slug }, d, { upsert: true, new: true });
    }
    const depts = await Department.find();
    res.status(201).json({ message: `${depts.length} departments seeded`, depts });
  } catch (err) { next(err); }
};
