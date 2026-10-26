import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('API Health Check Endpoint - GET /api/health', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.status, 'UP');
});

test('API Root Endpoint - GET /', async () => {
  const res = await request(app).get('/');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
});

test('Undefined Route - Returns HTTP 404 JSON', async () => {
  const res = await request(app).get('/api/non-existent-route-999');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

test('Protected Route Without Auth Header - Rejects with HTTP 401', async () => {
  const res = await request(app).get('/api/dashboard/summary');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('Auth Register Endpoint - Rejects incomplete payload with HTTP 400', async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test Officer'
    // Missing email & password
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('Auth Login Endpoint - Rejects empty payload with HTTP 400', async () => {
  const res = await request(app).post('/api/auth/login').send({});
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('Public Institutions List Endpoint - Accessible without authentication', async () => {
  const res = await request(app).get('/api/institutions/public-list');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
});

test('Public OTP Send Endpoint - Generates OTP for valid email', async () => {
  const res = await request(app).post('/api/complaints/public/send-otp').send({
    email: 'student@tce.edu',
    role: 'Student',
    name: 'Praveen Kumar'
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.otpPreview);
  assert.strictEqual(res.body.data.otpPreview.length, 6);
});

test('Public OTP Send Endpoint - Rejects invalid email address with HTTP 400', async () => {
  const res = await request(app).post('/api/complaints/public/send-otp').send({
    email: 'invalid-email-address',
    role: 'Student'
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('Public OTP Verify Endpoint - Rejects invalid OTP with HTTP 400', async () => {
  const res = await request(app).post('/api/complaints/public/verify-otp').send({
    email: 'student@tce.edu',
    otpCode: '000000'
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('Public Complaint Submission Endpoint - Rejects unverified email submission', async () => {
  const res = await request(app).post('/api/complaints/public').send({
    complainantType: 'Student',
    complainantName: 'Test Student',
    complainantEmail: 'unverified@student.tce.edu',
    institutionId: '507f1f77bcf86cd799439011',
    category: 'Student Grievances',
    subject: 'Unverified complaint test',
    description: 'This complaint should be rejected without verified email OTP.',
    otpCode: '999999'
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});
