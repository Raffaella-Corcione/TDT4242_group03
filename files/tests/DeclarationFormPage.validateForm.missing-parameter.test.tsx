import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

import DeclarationFormPage from '../client/src/pages/DeclarationFormPage';

describe('validateForm: shows error when parameter is missing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });
  });

  it('blocks submission and renders an error for missing parameters', async () => {
    render(
      <MemoryRouter>
        <DeclarationFormPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Mario' } });
    // Leave assignment title empty
    fireEvent.click(screen.getByText('ChatGPT'));
    fireEvent.change(screen.getByLabelText(/purpose of ai usage/i), { target: { value: 'summary of lecture contents' } });
    fireEvent.change(screen.getByLabelText(/ai-generated content/i), { target: { value: 'this is an example content.' } });

    fireEvent.click(screen.getByRole('button', { name: /submit declaration/i }));

    await waitFor(() => {
      expect((axios.post as unknown as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
    });

    expect(screen.getByText(/please enter the assignment title/i)).toBeInTheDocument();
  });
});
