import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

// Mock axios so network requests don't actually run
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

// Mock useNavigate to avoid navigation side effects during the test
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Import the component after mocks
import DeclarationFormPage from '../client/src/pages/DeclarationFormPage';

describe('DeclarationFormPage validateForm boundary case (very short name)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Make axios.post resolve successfully so submission proceeds past validation
    (axios.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true }
    });
  });

  it('accepts a single-character name and proceeds with submission (validateForm returns true behavior)', async () => {
    render(
      <MemoryRouter>
        <DeclarationFormPage />
      </MemoryRouter>
    );

    // Fill in form fields with the specified test data (name is a single character "O")
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'O' }
    });

    fireEvent.change(screen.getByLabelText(/assignment title/i), {
      target: { value: 'assignment 1' }
    });

    // Select ChatGPT checkbox by clicking its visible label text
    const chatgptLabel = screen.getByText('ChatGPT');
    fireEvent.click(chatgptLabel);

    // Leave "Other tool" empty

    fireEvent.change(screen.getByLabelText(/purpose of ai usage/i), {
      target: { value: 'summary of lecture contents' }
    });

    fireEvent.change(screen.getByLabelText(/ai-generated content/i), {
      target: { value: 'this is an example content.' }
    });

    // No screenshot provided (leave file input untouched)

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit declaration/i }));

    // If validation passed, axios.post should be called (submission proceeds).
    await waitFor(() => {
      expect((axios.post as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalled();
    });

    // Also assert that no validation error messages are shown
    expect(screen.queryByText(/please enter your name/i)).toBeNull();
    expect(screen.queryByText(/please enter the assignment title/i)).toBeNull();
    expect(screen.queryByText(/please select at least one ai tool/i)).toBeNull();
    expect(screen.queryByText(/please describe the purpose of ai usage/i)).toBeNull();
    expect(screen.queryByText(/please describe the ai-generated content/i)).toBeNull();
  });
});
