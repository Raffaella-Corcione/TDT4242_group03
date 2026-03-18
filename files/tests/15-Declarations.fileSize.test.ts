import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import declarationsRoutes from '../server/routes/declarations';

// Setup a mock Express app with the declarations router
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/declarations', declarationsRoutes);

// Mock error handler to catch the Multer file size limit error
app.use((err, req, res, next) => {
  // Multer attaches a 'code' property for its specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large' });
  }
  if (err.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

describe('Server-Side Form Validation: POST /api/declarations', () => {
  it('should reject a form submission when the uploaded image is larger than 5MB', async () => {
    // Generate a 6MB buffer filled with dummy data to simulate a large image file
    const largeImageBuffer = Buffer.alloc(6 * 1024 * 1024, 'a');
    
    // Perform a POST request as multipart/form-data using supertest
    const response = await request(app)
      .post('/api/declarations')
      .field('userName', 'Ola Nordmann')
      .field('assignmentTitle', 'Assignment 1')
      .field('aiTools', JSON.stringify(['ChatGPT'])) 
      .field('usagePurpose', 'this is an example purpose.')
      .field('aiContent', 'this is an example content')
      .attach('screenshot', largeImageBuffer, {
        filename: 'large_screenshot.png',
        contentType: 'image/png',
      });

    // Assert that the server rejected the request due to the size limit
    expect(response.status).toBe(413); // 413 Payload Too Large
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: 'File too large'
      })
    );
  });
});
