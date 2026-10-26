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

describe('validateForm: fails when Other tool contains special characters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });
  });

  it('blocks submission with π in Other tool field', async () => {
    render(
      <MemoryRouter>
        <DeclarationFormPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Mario' } });
    fireEvent.change(screen.getByLabelText(/assignment title/i), { target: { value: 'Assignment 1' } });
    fireEvent.click(screen.getByText('ChatGPT'));

    fireEvent.change(screen.getByLabelText(/other tool/i), { target: { value: 'π' } });
    fireEvent.change(screen.getByLabelText(/purpose of ai usage/i), { target: { value: 'This is an example purpose.' } });
    fireEvent.change(screen.getByLabelText(/ai-generated content/i), { target: { value: 'This is an example content.' } });

    fireEvent.click(screen.getByRole('button', { name: /submit declaration/i }));

    await waitFor(() => {
      expect((axios.post as unknown as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
    });
    
    expect(
      await screen.findByText(/custom tool name contains invalid characters/i)
    ).toBeInTheDocument();

  });
});
