import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import * as fs from 'fs';

// --- 1. MOCK SIDE EFFECTS (DB & File System) ---

// Prevent actual file creation/deletion by Multer/fs
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    unlinkSync: vi.fn()
  };
});

// Prevent actual database connections
vi.mock('../server/config/database', () => ({
  pool: {
    query: vi.fn(),
    execute: vi.fn()
  }
}));

// --- 2. SETUP TEST APP ---
// We import the real router, but the DB and FS it uses are mocked!
import declarationsRoutes from '../server/routes/declarations';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/declarations', declarationsRoutes);

// --- 3. TEST SUITE ---
describe('POST /api/declarations Validation (Test 11)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a validation error when userName is missing', async () => {
    // Act: Send a real HTTP request to our isolated Express app using Supertest
    const response = await request(app)
      .post('/api/declarations')
	  .field('userName', 'Mario')
      .field('assignmentTitle', 'assignment 1')
      .field('usagePurpose', 'this is an example purpose.')
      .field('aiContent', 'this is an example content.');
      // Intentionally omitting 'userName'

    // Assert: Check the HTTP response and our mocked utility
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('All fields except screenshot are required');
    
  });

});
