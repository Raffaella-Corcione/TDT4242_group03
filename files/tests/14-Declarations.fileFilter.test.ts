import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import declarationsRoutes from '../server/routes/declarations'; // Adjust the import path as needed

// Setup a mock Express app with the declarations router
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/declarations', declarationsRoutes);

// Mock error handler to catch the Multer file filter error gracefully
app.use((err, req, res, next) => {
  if (err.message === 'Only image files are allowed (jpeg, jpg, png, gif, webp)') {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

describe('Server-Side Form Validation: POST /api/declarations', () => {
  it('should reject a form submission when the uploaded screenshot is not an image', async () => {
    // Define the invalid file content (a text file instead of an image)
    const invalidFileBuffer = Buffer.from('This is a text file, not an image.', 'utf-8');
    
    // Perform a POST request as multipart/form-data using supertest
    const response = await request(app)
      .post('/api/declarations')
      .field('userName', 'Ola Nordmann')
      .field('assignmentTitle', 'Assignment 1')
      .field('aiTools', JSON.stringify(['ChatGPT'])) // Usually parsed as JSON string in FormData
      .field('usagePurpose', 'this is an example purpose.')
      .field('aiContent', 'this is an example content')
      .attach('screenshot', invalidFileBuffer, {
        filename: 'file.txt',
        contentType: 'text/plain',
      });

    // Assert that the server rejected the request due to the invalid file type
    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: 'Only image files are allowed (jpeg, jpg, png, gif, webp)'
      })
    );
  });
});
