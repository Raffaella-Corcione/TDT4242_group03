// client/src/pages/DeclarationFormPage.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DeclarationFormData, AI_TOOLS } from '../types';
import './DeclarationFormPage.css';

/**
 * DeclarationFormPage Component
 * 
 * Provides a form for students to declare AI usage in assignments
 * Allows selection of multiple predefined tools and custom tools
 * Supports optional screenshot upload
 */
const DeclarationFormPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState<DeclarationFormData>({
    userName: '',
    assignmentTitle: '',
    aiTools: [],
    customTool: '',
    usagePurpose: '',
    aiContent: '',
    screenshot: null
  });

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');

  /**
   * Handle text input changes
   */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle checkbox changes for AI tools
   */
  const handleToolChange = (tool: AITool) => {
    setFormData(prev => ({
      ...prev,
      aiTools: prev.aiTools.includes(tool)
        ? prev.aiTools.filter(t => t !== tool)
        : [...prev.aiTools, tool]
    }));
  };

  /**
   * Handle file upload
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        screenshot: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  /**
   * Remove uploaded screenshot
   */
  const removeScreenshot = () => {
    setFormData(prev => ({
      ...prev,
      screenshot: null
    }));
    setScreenshotPreview('');
  };

  /**
   * Validate form before submission
   */
  const validateForm = (): boolean => {
    if (!formData.userName.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.assignmentTitle.trim()) {
      setError('Please enter the assignment title');
      return false;
    }
    if (formData.aiTools.length === 0 && !formData.customTool.trim()) {
      setError('Please select at least one AI tool or enter a custom tool');
      return false;
    }
    if (!formData.usagePurpose.trim()) {
      setError('Please describe the purpose of AI usage');
      return false;
    }
    if (!formData.aiContent.trim()) {
      setError('Please describe the AI-generated content');
      return false;
    }
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare form data for submission
      const submitData = new FormData();
      submitData.append('userName', formData.userName.trim());
      submitData.append('assignmentTitle', formData.assignmentTitle.trim());
      submitData.append('usagePurpose', formData.usagePurpose.trim());
      submitData.append('aiContent', formData.aiContent.trim());

      // Combine selected tools and custom tool
      const allTools = [...formData.aiTools];
      if (formData.customTool.trim()) {
        allTools.push(formData.customTool.trim());
      }
      submitData.append('aiTools', JSON.stringify(allTools));

      // Add screenshot if provided
      if (formData.screenshot) {
        submitData.append('screenshot', formData.screenshot);
      }

      // Submit to API
      const response = await axios.post('/api/declarations', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Redirect to home page on success
        navigate('/');
      } else {
        setError('Failed to submit declaration. Please try again.');
      }
    } catch (err: any) {
      console.error('Error submitting declaration:', err);
      setError(
        err.response?.data?.message || 
        'Failed to submit declaration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel and return to home page
   */
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="declaration-form-page">
      <div className="container">
        <div className="form-container">
          {/* Form Header */}
          <div className="form-header">
            <h1>AI Usage Declaration</h1>
            <p>Please fill out this form to declare your use of AI tools in your assignment</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Declaration Form */}
          <form onSubmit={handleSubmit} className="declaration-form">
            {/* User Name */}
            <div className="form-group">
              <label htmlFor="userName" className="form-label required">
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            {/* Assignment Title */}
            <div className="form-group">
              <label htmlFor="assignmentTitle" className="form-label required">
                Assignment Title
              </label>
              <input
                type="text"
                id="assignmentTitle"
                name="assignmentTitle"
                value={formData.assignmentTitle}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter the assignment title"
                disabled={loading}
              />
            </div>

            {/* AI Tools Selection */}
            <div className="form-group">
              <label className="form-label required">
                AI Tools Used
              </label>
              <p className="form-help">Select all tools you used for this assignment</p>
              <div className="checkbox-grid">
                {AI_TOOLS.map(tool => (
                  <label key={tool} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.aiTools.includes(tool)}
                      onChange={() => handleToolChange(tool)}
                      disabled={loading}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">{tool}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Tool */}
            <div className="form-group">
              <label htmlFor="customTool" className="form-label">
                Other Tool (Optional)
              </label>
              <input
                type="text"
                id="customTool"
                name="customTool"
                value={formData.customTool}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter any other AI tool not listed above"
                disabled={loading}
              />
            </div>

            {/* Usage Purpose */}
            <div className="form-group">
              <label htmlFor="usagePurpose" className="form-label required">
                Purpose of AI Usage
              </label>
              <textarea
                id="usagePurpose"
                name="usagePurpose"
                value={formData.usagePurpose}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Describe why and how you used these AI tools"
                rows={4}
                disabled={loading}
              />
            </div>

            {/* AI Generated Content */}
            <div className="form-group">
              <label htmlFor="aiContent" className="form-label required">
                AI-Generated Content
              </label>
              <textarea
                id="aiContent"
                name="aiContent"
                value={formData.aiContent}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Describe what content was generated by AI"
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Screenshot Upload */}
            <div className="form-group">
              <label htmlFor="screenshot" className="form-label">
                Screenshot/Example (Optional)
              </label>
              <p className="form-help">Upload a screenshot or example of AI-generated content (max 5MB)</p>
              
              {!screenshotPreview ? (
                <div className="file-upload">
                  <input
                    type="file"
                    id="screenshot"
                    name="screenshot"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={loading}
                  />
                  <label htmlFor="screenshot" className="file-label">
                    <span className="file-icon">📎</span>
                    <span>Choose an image file</span>
                  </label>
                </div>
              ) : (
                <div className="file-preview">
                  <img src={screenshotPreview} alt="Preview" className="preview-image" />
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="remove-file-btn"
                    disabled={loading}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Declaration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeclarationFormPage;
