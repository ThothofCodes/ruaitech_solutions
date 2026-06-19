// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
//
// Targets the Continuity Audit's Exhibit D directly: isAdminRole() used to
// be `role.toLowerCase().includes('admin')`, which silently failed for
// 'DEPT_HEAD_OWNER' and 'STAFF' — meaning only SUPER_ADMIN could ever be
// "the admin" for chat, no matter how many department heads or staff were
// logged in. These tests pin the fixed behavior against the real role enum
// on the User model so a future edit can't quietly reintroduce the bug.

const { isAdminRole, isSuperAdminRole } = require('../socket');

describe('isAdminRole — real role-enum check (not substring matching)', () => {
  test('recognizes every role that should be able to answer chat', () => {
    expect(isAdminRole('SUPER_ADMIN')).toBe(true);
    expect(isAdminRole('DEPT_HEAD_OWNER')).toBe(true); // previously false — the actual bug
    expect(isAdminRole('STAFF')).toBe(true);            // previously false — the actual bug
    expect(isAdminRole('admin')).toBe(true);             // legacy role, still supported
    expect(isAdminRole('staff')).toBe(true);             // legacy role, still supported
  });

  test('rejects roles that should never be treated as admin-capable', () => {
    expect(isAdminRole('visitor')).toBe(false);
    expect(isAdminRole('client')).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole('')).toBe(false);
  });

  test('does not fall for substring tricks the old implementation was vulnerable to (or the reverse)', () => {
    // The OLD bug was role.toLowerCase().includes('admin') — a role like
    // 'administrative_assistant' would have wrongly passed under the old
    // logic. The fixed version checks exact membership in the real enum.
    expect(isAdminRole('administrative_assistant')).toBe(false);
    expect(isAdminRole('SUPER_ADMINISTRATOR')).toBe(false);
  });
});

describe('isSuperAdminRole — the highest clearance level in the system', () => {
  test('only the literal SUPER_ADMIN role qualifies', () => {
    expect(isSuperAdminRole('SUPER_ADMIN')).toBe(true);
  });

  test('every other role — including the legacy admin string and Dept Heads — does not', () => {
    expect(isSuperAdminRole('DEPT_HEAD_OWNER')).toBe(false);
    expect(isSuperAdminRole('STAFF')).toBe(false);
    expect(isSuperAdminRole('admin')).toBe(false); // legacy 'admin' is NOT the same as highest clearance
    expect(isSuperAdminRole('staff')).toBe(false);
    expect(isSuperAdminRole(undefined)).toBe(false);
  });
});
