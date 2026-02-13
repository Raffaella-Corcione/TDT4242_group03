// client/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DeclarationFormPage from './pages/DeclarationFormPage';

/**
 * Main App Component
 * 
 * Sets up routing for the application
 * - "/" - Home page with all declarations
 * - "/new-declaration" - Form to create new declaration
 */
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-declaration" element={<DeclarationFormPage />} />
      </Routes>
    </Router>
  );
};

export default App;