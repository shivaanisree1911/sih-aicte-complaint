import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES, ROLE_LABELS, BUREAUS } from '../src/config/roles.js';
import { authorizeRoles } from '../src/middleware/roleMiddleware.js';

test('RBAC Middleware - Permits Authorized Roles', () => {
  const middleware = authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT);
  
  let nextCalled = false;
  const mockReq = { user: { role: ROLES.SUPER_ADMIN } };
  const mockRes = {};
  const mockNext = () => { nextCalled = true; };

  middleware(mockReq, mockRes, mockNext);
  assert.strictEqual(nextCalled, true, 'Next must be called when role matches');
});

test('RBAC Middleware - Rejects Unauthorized Roles with 403', () => {
  const middleware = authorizeRoles(ROLES.SUPER_ADMIN);
  
  let nextCalled = false;
  let statusSent = null;
  let jsonSent = null;

  const mockReq = { user: { role: ROLES.AUDITOR } };
  const mockRes = {
    status: (code) => {
      statusSent = code;
      return {
        json: (data) => { jsonSent = data; }
      };
    }
  };
  const mockNext = () => { nextCalled = true; };

  middleware(mockReq, mockRes, mockNext);

  assert.strictEqual(nextCalled, false, 'Next must not be called when unauthorized');
  assert.strictEqual(statusSent, 403, 'Must return HTTP 403 Forbidden');
  assert.strictEqual(jsonSent.success, false);
});

test('RBAC Configuration - Ensure Standard AICTE Roles and Bureaus', () => {
  assert.ok(ROLES.SUPER_ADMIN);
  assert.ok(ROLES.SENIOR_MANAGEMENT);
  assert.ok(ROLES.BUREAU_OFFICER);
  assert.ok(ROLES.REGIONAL_OFFICER);
  assert.ok(ROLES.AUDITOR);
  assert.ok(ROLES.STUDENT);
  assert.ok(ROLES.FACULTY);
  assert.ok(ROLES.PRINCIPAL);

  assert.ok(BUREAUS.includes('Regulation Bureau (RB)'));
  assert.ok(BUREAUS.includes('Public Grievance Redressal Cell (PGRC)'));
});
