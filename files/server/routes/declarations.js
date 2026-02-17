// server/routes/declarations.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure multer for file upload handling
 * Files are stored with unique timestamps to prevent naming conflicts
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'screenshot-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * GET /api/declarations
 * Retrieve all AI usage declarations from the database
 * Returns declarations ordered by most recent first
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ai_declarations ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching declarations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch declarations',
      error: error.message
    });
  }
});

/**
 * POST /api/declarations
 * Create new AI usage declaration(s)
 * Accepts multiple AI tools and creates separate records for each
 * Optionally accepts a screenshot file upload
 */
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const { userName, assignmentTitle, aiTools, usagePurpose, aiContent } = req.body;

    // Validate required fields
    if (!userName || !assignmentTitle || !aiTools || !usagePurpose || !aiContent) {
      // If file was uploaded but validation failed, delete it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'All fields except screenshot are required'
      });
    }

    // Parse aiTools (comes as JSON string from FormData)
    let toolsArray;
    try {
      toolsArray = JSON.parse(aiTools);
      if (!Array.isArray(toolsArray) || toolsArray.length === 0) {
        throw new Error('AI tools must be a non-empty array');
      }
    } catch (parseError) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid AI tools format'
      });
    }

    // Get screenshot path if file was uploaded
    const screenshotPath = req.file ? `/uploads/${req.file.filename}` : null;

    // Create a separate record for each AI tool
    const insertPromises = toolsArray.map(tool => {
      return pool.query(
        `INSERT INTO ai_declarations 
        (user_name, assignment_title, ai_tool, usage_purpose, ai_content, screenshot_path) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [userName, assignmentTitle, tool, usagePurpose, aiContent, screenshotPath]
      );
    });

    // Execute all inserts
    await Promise.all(insertPromises);

    res.status(201).json({
      success: true,
      message: `Successfully created ${toolsArray.length} declaration(s)`,
    });

  } catch (error) {
    console.error('Error creating declaration:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create declaration',
      error: error.message
    });
  }
});

module.exports = router;
