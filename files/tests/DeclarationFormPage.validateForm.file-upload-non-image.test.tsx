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

describe('validateForm: rejects non-image file uploads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });
  });

  it('blocks submission and shows error for PDF upload', async () => {
    render(
      <MemoryRouter>
        <DeclarationFormPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Mario' } });
    fireEvent.change(screen.getByLabelText(/assignment title/i), { target: { value: 'Assignment 1' } });
    fireEvent.click(screen.getByText('ChatGPT'));

    fireEvent.change(screen.getByLabelText(/purpose of ai usage/i), { target: { value: 'This is an example purpose.' } });
    fireEvent.change(screen.getByLabelText(/ai-generated content/i), { target: { value: 'This is an example content.' } });

    const file = new File(['%PDF-1.4 fake'], 'IEEE-SRS-830-1998.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/screenshot/i);
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/please upload an image file/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /submit declaration/i }));

    await waitFor(() => {
      expect((axios.post as any)).toHaveBeenCalled();
    });

  });
});
