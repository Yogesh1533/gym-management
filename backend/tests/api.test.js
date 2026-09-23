/**
 * PY Fitness — Backend API Tests
 * Run with: node tests/api.test.js
 * No external libraries needed — uses built-in http module only
 */

require('dotenv').config();
const http = require('http');

const BASE_URL = 'http://localhost:5000';
let memberToken = '';
let adminToken  = '';
let sessionId   = '';
let bookingId   = '';

// ─── Test Runner ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const results = [];

const assert = (testName, condition, detail = '') => {
  if (condition) {
    passed++;
    results.push(`  ✅ PASS: ${testName}`);
  } else {
    failed++;
    results.push(`  ❌ FAIL: ${testName}${detail ? ' — ' + detail : ''}`);
  }
};

// ─── HTTP Helper ─────────────────────────────────────────────────────────────
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
        ...(token && { 'Authorization': `Bearer ${token}` }),
      }
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

// ─── Tests ───────────────────────────────────────────────────────────────────

const runTests = async () => {
  console.log('\n🧪 PY Fitness — API Test Suite');
  console.log('================================\n');

  // ── AUTH TESTS ──────────────────────────────────────────────────────────────
  console.log('📋 AUTH TESTS');

  // Test 1: Register with missing fields
  let res = await request('POST', '/api/auth/register', { email: 'test@test.com' });
  assert('Register fails with missing name/password', res.status === 400);

  // Test 2: Register with invalid email
  res = await request('POST', '/api/auth/register', { name: 'Test', email: 'notanemail', password: '123456' });
  assert('Register fails with invalid email', res.status === 400);

  // Test 3: Register with short password
  res = await request('POST', '/api/auth/register', { name: 'Test', email: 'test@test.com', password: '123' });
  assert('Register fails with short password (< 6 chars)', res.status === 400);

  // Test 4: Login with wrong password
  res = await request('POST', '/api/auth/login', { email: 'john@gym.com', password: 'wrongpassword' });
  assert('Login fails with wrong password', res.status === 401);
  assert('Login error message is correct', res.body.message === 'Invalid email or password');

  // Test 5: Login with non-existent email
  res = await request('POST', '/api/auth/login', { email: 'nobody@gym.com', password: 'member123' });
  assert('Login fails with non-existent email', res.status === 401);

  // Test 6: Member login success
  res = await request('POST', '/api/auth/login', { email: 'john@gym.com', password: 'member123' });
  assert('Member login succeeds', res.status === 200);
  assert('Member login returns token', !!res.body.token);
  assert('Member login returns user object', !!res.body.user);
  assert('Member role is correct', res.body.user.role === 'member');
  memberToken = res.body.token;

  // Test 7: Admin login success
  res = await request('POST', '/api/auth/login', { email: 'admin@gym.com', password: 'admin123' });
  assert('Admin login succeeds', res.status === 200);
  assert('Admin role is correct', res.body.user.role === 'admin');
  adminToken = res.body.token;

  // Test 8: Get current user without token
  res = await request('GET', '/api/auth/me');
  assert('GET /me fails without token', res.status === 401);

  // Test 9: Get current user with valid token
  res = await request('GET', '/api/auth/me', null, memberToken);
  assert('GET /me succeeds with valid token', res.status === 200);
  assert('GET /me returns correct user', res.body.email === 'john@gym.com');

  // ── USER TESTS ──────────────────────────────────────────────────────────────
  console.log('\n📋 USER TESTS');

  // Test 10: Get profile
  res = await request('GET', '/api/users/profile', null, memberToken);
  assert('GET profile succeeds', res.status === 200);
  assert('Profile does not expose password', !res.body.password);
  assert('Profile returns name', !!res.body.name);

  // Test 11: Get profile without token
  res = await request('GET', '/api/users/profile');
  assert('GET profile fails without token', res.status === 401);

  // Test 12: Update profile
  res = await request('PUT', '/api/users/profile', { name: 'John Updated', phone: '+1-555-9999', age: 29, weight: 86, height: 178, fitnessGoal: 'muscle_gain' }, memberToken);
  assert('Update profile succeeds', res.status === 200);
  assert('Profile name updated correctly', res.body.name === 'John Updated');

  // Test 13: Get foods list
  res = await request('GET', '/api/users/foods', null, memberToken);
  assert('GET foods succeeds', res.status === 200);
  assert('Foods list has items', Array.isArray(res.body) && res.body.length > 0);
  assert('Foods have correct structure', res.body[0].hasOwnProperty('per100g'));

  // Test 14: Log weight with invalid value
  res = await request('POST', '/api/users/weight-log', { weight: 5 }, memberToken);
  assert('Weight log fails with invalid weight (< 20)', res.status === 400);

  // Test 15: Log weight successfully
  res = await request('POST', '/api/users/weight-log', { weight: 86.5, note: 'After workout' }, memberToken);
  assert('Weight log succeeds', res.status === 201);
  assert('Weight log returns entry', res.body.weight === 86.5);

  // Test 16: Get weight logs
  res = await request('GET', '/api/users/weight-log', null, memberToken);
  assert('GET weight logs succeeds', res.status === 200);
  assert('Weight logs is an array', Array.isArray(res.body));

  // Test 17: Change password with wrong current password
  res = await request('PUT', '/api/users/change-password', { currentPassword: 'wrongpass', newPassword: 'newpass123' }, memberToken);
  assert('Change password fails with wrong current password', res.status === 400);

  // ── SESSION TESTS ───────────────────────────────────────────────────────────
  console.log('\n📋 SESSION TESTS');

  // Test 18: Get upcoming sessions
  res = await request('GET', '/api/sessions', null, memberToken);
  assert('GET sessions succeeds', res.status === 200);
  assert('Sessions is an array', Array.isArray(res.body));
  assert('Sessions have required fields', res.body.length === 0 || (res.body[0].title && res.body[0].trainer));
  if (res.body.length > 0) sessionId = res.body[0].id;

  // Test 19: Get sessions without token
  res = await request('GET', '/api/sessions');
  assert('GET sessions fails without token', res.status === 401);

  // ── BOOKING TESTS ───────────────────────────────────────────────────────────
  console.log('\n📋 BOOKING TESTS');

  // Test 20: Book a session
  if (sessionId) {
    res = await request('POST', '/api/bookings', { sessionId }, memberToken);
    assert('Book session succeeds', res.status === 201 || res.status === 200);
    if (res.status === 201) {
      assert('Booking returns session data', !!res.body.session);
      bookingId = res.body.id;
    } else {
      assert('Session full — added to waitlist', res.body.waitlisted === true);
    }

    // Test 21: Book same session again
    res = await request('POST', '/api/bookings', { sessionId }, memberToken);
    assert('Cannot book same session twice', res.status === 400);
  }

  // Cancelling and re-booking the same session must work
  if (bookingId) {
    res = await request('PUT', `/api/bookings/${bookingId}/cancel`, null, memberToken);
    assert('Cancel booking succeeds', res.status === 200);
    res = await request('POST', '/api/bookings', { sessionId }, memberToken);
    assert('Can re-book a cancelled session', res.status === 201);
  }

  // Membership session limits are enforced (Mike is on Starter: 2 bookings/month)
  res = await request('POST', '/api/auth/login', { email: 'mike@gym.com', password: 'member123' });
  const mikeToken = res.body.token;
  const upcoming = (await request('GET', '/api/sessions', null, mikeToken)).body;
  if (mikeToken && upcoming.length >= 3) {
    const statuses = [];
    for (const s of upcoming.slice(0, 3))
      statuses.push((await request('POST', '/api/bookings', { sessionId: s.id }, mikeToken)).status);
    assert('Starter plan allows 2 bookings', statuses[0] !== 403 && statuses[1] !== 403, statuses.join(','));
    assert('Starter plan blocks the 3rd booking', statuses[2] === 403, statuses.join(','));
  }

  // Test 22: Get my bookings
  res = await request('GET', '/api/bookings/my', null, memberToken);
  assert('GET my bookings succeeds', res.status === 200);
  assert('Bookings is an array', Array.isArray(res.body));

  // Test 23: Get waitlist
  res = await request('GET', '/api/bookings/waitlist', null, memberToken);
  assert('GET waitlist succeeds', res.status === 200);
  assert('Waitlist is an array', Array.isArray(res.body));

  // ── NOTIFICATION TESTS ──────────────────────────────────────────────────────
  console.log('\n📋 NOTIFICATION TESTS');

  // Test 24: Get notifications
  res = await request('GET', '/api/notifications', null, memberToken);
  assert('GET notifications succeeds', res.status === 200);
  assert('Notifications list is an array', Array.isArray(res.body.notifications));

  // Test 25: Get unread count
  res = await request('GET', '/api/notifications/unread-count', null, memberToken);
  assert('GET unread count succeeds', res.status === 200);
  assert('Unread count is a number', typeof res.body.count === 'number');

  // Test 26: Mark all read
  res = await request('PUT', '/api/notifications/read-all', null, memberToken);
  assert('Mark all read succeeds', res.status === 200);

  // ── MEMBERSHIP TESTS ────────────────────────────────────────────────────────
  console.log('\n📋 MEMBERSHIP TESTS');

  // Test 27: Get public plans (no auth needed)
  res = await request('GET', '/api/memberships/public');
  assert('GET public membership plans succeeds', res.status === 200);
  assert('Returns 4 plans', res.body.length === 4);
  assert('Plans have price field', res.body[0].hasOwnProperty('price'));
  assert('Plans have features array', Array.isArray(res.body[0].features));

  // Test 28: Get my membership
  res = await request('GET', '/api/memberships/my', null, memberToken);
  assert('GET my membership succeeds', res.status === 200);
  assert('Returns plan object', res.body.hasOwnProperty('plan'));

  // Test 29: Member cannot access admin membership routes
  res = await request('GET', '/api/memberships', null, memberToken);
  assert('Member cannot access admin membership list', res.status === 403);

  // ── ADMIN TESTS ─────────────────────────────────────────────────────────────
  console.log('\n📋 ADMIN TESTS');

  // Test 30: Member cannot access admin routes
  res = await request('GET', '/api/admin/dashboard', null, memberToken);
  assert('Member blocked from admin dashboard', res.status === 403);

  // Test 31: Admin dashboard stats
  res = await request('GET', '/api/admin/dashboard', null, adminToken);
  assert('Admin dashboard succeeds', res.status === 200);
  assert('Dashboard has totalMembers', typeof res.body.totalMembers === 'number');
  assert('Dashboard has totalSessions', typeof res.body.totalSessions === 'number');
  assert('Dashboard has totalBookings', typeof res.body.totalBookings === 'number');
  assert('Dashboard member count is 3', res.body.totalMembers === 3);

  // Test 32: Get all members
  res = await request('GET', '/api/admin/members', null, adminToken);
  assert('Admin GET members succeeds', res.status === 200);
  assert('Returns 3 members', res.body.length === 3);
  assert('Members do not expose passwords', !res.body[0].password);

  // Test 33: Get all sessions (admin)
  res = await request('GET', '/api/admin/sessions', null, adminToken);
  assert('Admin GET sessions succeeds', res.status === 200);
  assert('Returns 5 sessions', res.body.length === 5);

  // Test 34: Get all bookings (admin)
  res = await request('GET', '/api/admin/bookings', null, adminToken);
  assert('Admin GET bookings succeeds', res.status === 200);
  assert('Bookings is an array', Array.isArray(res.body));

  // Test 35: Get workout plans
  res = await request('GET', '/api/admin/workout-plans', null, adminToken);
  assert('Admin GET workout plans succeeds', res.status === 200);
  assert('Returns 2 workout plans', res.body.length >= 2);

  // Test 36: Get diet plans
  res = await request('GET', '/api/admin/diet-plans', null, adminToken);
  assert('Admin GET diet plans succeeds', res.status === 200);
  assert('Returns 2 diet plans', res.body.length >= 2);

  // Test 37: Create a session
  res = await request('POST', '/api/admin/sessions', {
    title: 'Test Session',
    trainer: 'Test Trainer',
    sessionType: 'general',
    date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    totalSlots: 5,
    location: 'Test Room'
  }, adminToken);
  assert('Admin create session succeeds', res.status === 201);
  assert('Created session has correct title', res.body.title === 'Test Session');
  const newSessionId = res.body.id;

  // Test 38: Update the session
  res = await request('PUT', `/api/admin/sessions/${newSessionId}`, { title: 'Updated Session' }, adminToken);
  assert('Admin update session succeeds', res.status === 200);
  assert('Session title updated', res.body.title === 'Updated Session');

  // Test 39: Delete the session
  res = await request('DELETE', `/api/admin/sessions/${newSessionId}`, null, adminToken);
  assert('Admin delete session succeeds', res.status === 200);

  // Test 40: Send notification to all members
  res = await request('POST', '/api/admin/notifications/send', {
    recipientId: 'all',
    title: 'Test Notification',
    message: 'This is a test notification',
    type: 'general'
  }, adminToken);
  assert('Admin send notification succeeds', res.status === 200);
  assert('Notification sent to all members', res.body.message.includes('3 members'));

  // Test 41: Send notification without title
  res = await request('POST', '/api/admin/notifications/send', {
    recipientId: 'all',
    message: 'No title here'
  }, adminToken);
  assert('Notification fails without title', res.status === 400);

  // ── SECURITY TESTS ──────────────────────────────────────────────────────────
  console.log('\n📋 SECURITY TESTS');

  // Test 42: Access protected route with fake token
  res = await request('GET', '/api/users/profile', null, 'faketoken123');
  assert('Fake token is rejected', res.status === 401);

  // Test 43: Access protected route with expired/malformed token
  res = await request('GET', '/api/auth/me', null, 'Bearer malformed.token.here');
  assert('Malformed token is rejected', res.status === 401);

  // Test 44: 404 for unknown route
  res = await request('GET', '/api/unknown/route', null, adminToken);
  assert('Unknown route returns 404', res.status === 404);

  // Test 45: Generate plan without weight/height
  res = await request('POST', '/api/users/generate-plan', { gymDays: 3 }, memberToken);
  // John has weight/height so this should succeed
  assert('Generate plan succeeds for member with stats', res.status === 200);
  assert('Generated plan has BMI', !!res.body.bmi);
  assert('Generated plan has bmiCategory', !!res.body.bmiCategory);

  // Registration form sends blank optional fields as empty strings
  res = await request('POST', '/api/auth/register', {
    name: 'Blank Fields', email: `blank${Date.now()}@test.com`, password: 'secret123',
    phone: '', age: '', weight: '', height: '', fitnessGoal: 'general_fitness'
  });
  assert('Register succeeds with blank optional fields', res.status === 201, JSON.stringify(res.body));

  // ── PRINT RESULTS ───────────────────────────────────────────────────────────
  console.log('\n================================');
  console.log('📊 TEST RESULTS\n');
  results.forEach(r => console.log(r));
  console.log('\n================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${passed + failed}`);
  console.log(`📈 Score:  ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
};

runTests().catch(err => {
  console.error('❌ Test runner crashed:', err.message);
  process.exit(1);
});
