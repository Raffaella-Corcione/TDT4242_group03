import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';

describe('Server Errors - Database Failures', () => {
  let app: any;
  let originalDbPassword: string | undefined;

  beforeAll(async () => {
    // 1. Store the original password and force an invalid one
    originalDbPassword = process.env.DB_PASSWORD;
    process.env.DB_PASSWORD = 'THIS_IS_A_WRONG_PASSWORD_TO_FORCE_A_FAILURE';
    process.env.NODE_ENV = 'development'; // Ensure error details are returned

    // 2. Clear Vitest's module cache. 
    // This forces Node to re-read database.js and declarations.js,
    // causing it to create a NEW pool using our bad password.
    vi.resetModules();

    // 3. Dynamically import Express and your router AFTER changing the env vars
    const express = (await import('express')).default;
    const declarationsRoutes = (await import('../server/routes/declarations')).default;

    // 4. Set up the Express app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/declarations', declarationsRoutes);
  });

  afterAll(() => {
    // 5. Restore the original password so we don't break other test files
    process.env.DB_PASSWORD = originalDbPassword;
  });

  it('should handle GET failure and return a 500 serverError', async () => {
    // Act: Make a GET request
    // Since the pool has a bad password, it will fail to connect and throw.
    const response = await request(app).get('/api/declarations');

    // Assert: Check that the router caught the error and returned a 500
    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: 'Failed to fetch declarations'
      })
    );
    expect(response.body.error).toBeDefined();
  });

  it('should handle POST failure and return a 500 serverError', async () => {
    // Act: Make a POST request with valid data
    // Since the pool has a bad password, the insert query will fail.
    const response = await request(app)
      .post('/api/declarations')
      .field('userName', 'Test User')
      .field('assignmentTitle', 'Test Assignment')
      .field('aiTools', JSON.stringify(['ChatGPT'])) 
      .field('usagePurpose', 'Debugging code')
      .field('aiContent', 'Generated boilerplate');

    // Assert: Check that the router caught the error and returned a 500
    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: 'Failed to create declaration'
      })
    );
    expect(response.body.error).toBeDefined();
  });
});
