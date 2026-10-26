// tests/DeclarationFormPage.submit-success.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

// ONE stable instance that the component will receive
const navigateMock = vi.fn();

// Define mocks BEFORE importing the component
vi.mock('axios', () => ({ default: { post: vi.fn() } }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock, // the component gets THIS exact instance
  };
});

import { MemoryRouter } from 'react-router-dom';
import DeclarationFormPage from '../client/src/pages/DeclarationFormPage';

// Helper to satisfy validateForm()
const fillRequired = () => {
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Mario' } });
  fireEvent.change(screen.getByLabelText(/assignment title/i), { target: { value: 'Assignment 1' } });
  fireEvent.click(screen.getByText('ChatGPT')); // select at least one tool
  fireEvent.change(screen.getByLabelText(/purpose of ai usage/i), { target: { value: 'purpose' } });
  fireEvent.change(screen.getByLabelText(/ai-generated content/i), { target: { value: 'content' } });
};

describe('DeclarationFormPage: submit success path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.post as any).mockResolvedValue({ data: { success: true } });
  });

  it('submits and navigates to "/" on success', async () => {
    render(
      <MemoryRouter>
        <DeclarationFormPage />
      </MemoryRouter>
    );

    fillRequired();
    fireEvent.click(screen.getByRole('button', { name: /submit declaration/i }));

    // Navigate happens AFTER axios resolves
    await waitFor(() => {
      expect((axios.post as any)).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });
});