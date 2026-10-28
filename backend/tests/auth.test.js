import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';

describe('Scenario 1: Authentication & Authorization Flow', () => {
  let app;
  let tokens;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
    tokens = env.tokens;
  });

  afterAll(() => {
    teardownTestEnvironment();
  });

  it('allows a student to register successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'New Student',
        email: 'new.student@learnsphere.io',
        password: 'ValidPassword123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('new.student@learnsphere.io');
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.user.password_hash).toBeUndefined(); // Never expose hash!
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects registration when email is already registered (HTTP 409)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Duplicate Student',
        email: 'student@learnsphere.io', // Already seeded in setup
        password: 'ValidPassword123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('rejects registration when password fails complexity checks (HTTP 400)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Weak Password User',
        email: 'weak@learnsphere.io',
        password: 'weak', // Less than 8 chars
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
  });

  it('authenticates valid login and issues JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@learnsphere.io',
        password: 'TestPass123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('student@learnsphere.io');
  });

  it('rejects login with invalid password (HTTP 401)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@learnsphere.io',
        password: 'IncorrectPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('retrieves current authenticated profile from /me endpoint', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${tokens.student}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe('user-student');
    expect(res.body.data.user.role).toBe('student');
  });

  it('rejects /me when no token is provided (HTTP 401)', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('MISSING_TOKEN');
  });

  it('authenticates a registered student using their email or username/name', async () => {
    // 1. Register student
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ponytail Student',
        email: 'ponytail.student@learnsphere.io',
        password: 'ValidPassword123!',
      });

    // 2. Login by email
    const emailLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'ponytail.student@learnsphere.io',
        password: 'ValidPassword123!',
      });
    expect(emailLogin.status).toBe(200);
    expect(emailLogin.body.data.user.full_name).toBe('Ponytail Student');

    // 3. Login by username/full name
    const usernameLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'Ponytail Student',
        password: 'ValidPassword123!',
      });
    expect(usernameLogin.status).toBe(200);
    expect(usernameLogin.body.data.user.email).toBe('ponytail.student@learnsphere.io');

    // 4. Login by username prefix / handle
    const handleLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'ponytail.student',
        password: 'ValidPassword123!',
      });
    expect(handleLogin.status).toBe(200);
    expect(handleLogin.body.data.user.email).toBe('ponytail.student@learnsphere.io');
  });
});
