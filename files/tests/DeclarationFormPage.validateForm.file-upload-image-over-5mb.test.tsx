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

describe('validateForm: rejects image uploads larger than 5MB', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });
  });

  it('blocks submission and shows file-too-large error for >5MB image', async () => {
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

    const bigSize = 5 * 1024 * 1024 + 1; // just over 5MB
    const bigBlob = new Blob([new Uint8Array(bigSize)], { type: 'image/jpeg' });
    const bigFile = new File([bigBlob], 'danny-greenberg-HAP8ECXx5CA-unsplash.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/screenshot/i);
    fireEvent.change(input, { target: { files: [bigFile] } });

    expect(await screen.findByText(/file size must be less than 5mb/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /submit declaration/i }));

    await waitFor(() => {
      expect((axios.post as any)).toHaveBeenCalled();
    });

  });
});
