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

describe('validateForm: shows error when no AI tool is selected', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });
  });

  it('blocks submission and requests selecting at least one AI tool', async () => {
    render(
      <MemoryRouter>
        <DeclarationFormPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Mario' } });
    fireEvent.change(screen.getByLabelText(/assignment title/i), { target: { value: 'Assignment 1' } });
    // Do not select any tool
    fireEvent.change(screen.getByLabelText(/purpose of ai usage/i), { target: { value: 'this is an example purpose.' } });
    fireEvent.change(screen.getByLabelText(/ai-generated content/i), { target: { value: 'this is an example content.' } });

    fireEvent.click(screen.getByRole('button', { name: /submit declaration/i }));

    await waitFor(() => {
      expect((axios.post as unknown as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
    });

    expect(screen.getByText(/please select at least one ai tool/i)).toBeInTheDocument();
  });
});
