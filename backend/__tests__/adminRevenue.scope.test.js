// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
//
// Targets the Continuity Audit's Part Two finding directly: any staff-level
// account could previously see every department's consolidated revenue via
// /api/admin/stats, because no department filter was ever applied. This
// pins the rule the user asked to be remembered throughout this fix pass:
// SUPER_ADMIN holds the highest clearance level and sees everything;
// everyone else is scoped to their own department only.

const { scopeFilter } = require('../controllers/adminRevenueController');

describe('adminRevenueController.scopeFilter — department scoping with SUPER_ADMIN bypass', () => {
  test('SUPER_ADMIN gets no filter at all — sees every department, by design', () => {
    const req = { user: { role: 'SUPER_ADMIN', department: 'irrelevant-even-if-set' } };
    expect(scopeFilter(req)).toEqual({});
  });

  test('DEPT_HEAD_OWNER is restricted to their own department', () => {
    const req = { user: { role: 'DEPT_HEAD_OWNER', department: 'dept-cybersecurity-id' } };
    expect(scopeFilter(req)).toEqual({ department: 'dept-cybersecurity-id' });
  });

  test('STAFF is restricted to their own department', () => {
    const req = { user: { role: 'STAFF', department: 'dept-repair-id' } };
    expect(scopeFilter(req)).toEqual({ department: 'dept-repair-id' });
  });

  test('handles a populated department document, not just a raw ObjectId string', () => {
    const req = { user: { role: 'STAFF', department: { _id: 'dept-playstation-id', name: 'PlayStation Arena' } } };
    expect(scopeFilter(req)).toEqual({ department: 'dept-playstation-id' });
  });

  test('an account with no department is scoped to nothing visible, not everything (safe default)', () => {
    const req = { user: { role: 'STAFF', department: null } };
    expect(scopeFilter(req)).toEqual({ department: null });
  });

  test('legacy "admin" role string does NOT get the SUPER_ADMIN bypass — only the literal SUPER_ADMIN role does', () => {
    const req = { user: { role: 'admin', department: 'dept-webdev-id' } };
    expect(scopeFilter(req)).toEqual({ department: 'dept-webdev-id' });
  });
});
