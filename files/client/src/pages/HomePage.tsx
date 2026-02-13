// client/src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Declaration } from '../types';
import './HomePage.css';

/**
 * HomePage Component
 * 
 * Displays all submitted AI usage declarations
 * Provides a link to create new declarations
 * This is the landing page of the application
 */
const HomePage: React.FC = () => {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  /**
   * Fetch all declarations from the API when component mounts
   */
  useEffect(() => {
    fetchDeclarations();
  }, []);

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/declarations');
      
      if (response.data.success) {
        setDeclarations(response.data.data);
      } else {
        setError('Failed to load declarations');
      }
    } catch (err) {
      console.error('Error fetching declarations:', err);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date string to a more readable format
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Group declarations by assignment to show them together
   */
  const groupedDeclarations = declarations.reduce((acc, declaration) => {
    const key = `${declaration.user_name}-${declaration.assignment_title}-${declaration.created_at}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(declaration);
    return acc;
  }, {} as Record<string, Declaration[]>);

  return (
    <div className="home-page">
      {/* Header Section */}
      <header className="page-header">
        <div className="container">
          <h1>AI Guidebook System</h1>
          <p className="subtitle">Track and manage AI tool usage in academic assignments</p>
          <Link to="/new-declaration" className="btn btn-primary">
            + Create New Declaration
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        <div className="declarations-section">
          <h2>Submitted Declarations ({declarations.length})</h2>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading declarations...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
              <button onClick={fetchDeclarations} className="btn btn-secondary">
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && declarations.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No declarations yet</h3>
              <p>Start by creating your first AI usage declaration</p>
              <Link to="/new-declaration" className="btn btn-primary">
                Create First Declaration
              </Link>
            </div>
          )}

          {/* Declarations List - Grouped by Assignment */}
          {!loading && !error && declarations.length > 0 && (
            <div className="declarations-list">
              {Object.values(groupedDeclarations).map((group, index) => {
                const firstDeclaration = group[0];
                return (
                  <div key={index} className="declaration-card">
                    <div className="card-header">
                      <div>
                        <h3>{firstDeclaration.assignment_title}</h3>
                        <p className="user-info">
                          <span className="user-icon">👤</span>
                          {firstDeclaration.user_name}
                        </p>
                      </div>
                      <span className="date-badge">
                        {formatDate(firstDeclaration.created_at)}
                      </span>
                    </div>

                    <div className="card-body">
                      {/* AI Tools Used */}
                      <div className="info-section">
                        <h4>AI Tools Used:</h4>
                        <div className="tools-list">
                          {group.map((decl) => (
                            <span key={decl.id} className="tool-badge">
                              {decl.ai_tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Usage Purpose */}
                      <div className="info-section">
                        <h4>Purpose:</h4>
                        <p>{firstDeclaration.usage_purpose}</p>
                      </div>

                      {/* AI Generated Content */}
                      <div className="info-section">
                        <h4>AI-Generated Content:</h4>
                        <p className="content-text">{firstDeclaration.ai_content}</p>
                      </div>

                      {/* Screenshot if available */}
                      {firstDeclaration.screenshot_path && (
                        <div className="info-section">
                          <h4>Screenshot/Example:</h4>
                          <div className="screenshot-container">
                            <img 
                              src={firstDeclaration.screenshot_path} 
                              alt="AI usage screenshot"
                              className="screenshot-image"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;