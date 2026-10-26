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
    unlinkSync: vi.fn() // We expect this to be called if a file was uploaded, though here we have no file
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
import declarationsRoutes from '../server/routes/declarations';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/declarations', declarationsRoutes);

// --- 3. TEST SUITE ---
describe('POST /api/declarations Invalid Character Validation (Test 12)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a validation error when an AI tool contains an invalid special character (π)', async () => {
    // Arrange: Create the payload with the invalid character "π"
    const customToolName = 'tool π 314';
    const aiToolsArray = JSON.stringify(['ChatGPT', customToolName]);

    // Act: Send the POST request to the isolated route
    const response = await request(app)
      .post('/api/declarations')
      .field('userName', 'Ola Nordmann')
      .field('assignmentTitle', 'assignment 1')
      .field('aiTools', aiToolsArray)
      .field('usagePurpose', 'This is an example purpose')
      .field('aiContent', 'This is an example content.');
      // (none) for screenshot

    // Assert: Verify the server caught the invalid character and returned a 400
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    
    // The exact message defined in the server code block you provided
    expect(response.body.message).toBe(
      `Invalid tool name "tool π 314". Tool names can only contain letters, numbers, punctuation, and spaces.`
    );
  });

});
