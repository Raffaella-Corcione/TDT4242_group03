// tests/DeclarationFormPage.submit-success.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

// ONE stable instance returned to component
const navigateMock = vi.fn();

vi.mock('axios', () => ({ default: { post: vi.fn() } }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock, // always this instance
  };
});

import { MemoryRouter } from 'react-router-dom';
import DeclarationFormPage from '../client/src/pages/DeclarationFormPage';

// Helper: fill all required fields to pass validateForm()
const fillRequiredBase = () => {
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

    fillRequiredBase();
    fireEvent.click(screen.getByRole('button', { name: /submit declaration/i }));

    // Wait for axios to be invoked
    await waitFor(() => {
      expect((axios.post as any)).toHaveBeenCalled();
    });

    // Then wait for navigate('/') (triggered in the success branch)
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });
});