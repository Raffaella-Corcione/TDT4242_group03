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

describe('DeclarationFormPage validateForm boundary case (very long purpose)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ 
        data: { success: true } 
    });
  });

  it('accepts a very long purpose and proceeds with submission (validateForm returns true behavior)', async () => {
    render(
      <MemoryRouter>
        <DeclarationFormPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Mario' } });
    fireEvent.change(screen.getByLabelText(/assignment title/i), { target: { value: 'Assignment 1' } });
    fireEvent.click(screen.getByText('ChatGPT'));

    const longPurpose = 'AI Guidebook for Students is a student-centred web application developed to support everyday academic work in an era where generative AI tools such as ChatGPT, GitHub Copilot, and Claude are increasingly embedded in study practices. As students adopt AI tools rapidly, there is a growing need for clear guidance that helps them use AI responsibly, transparently, and in alignment with institutional academic integrity policies. The AI Guidebook provides a structured environment where students can reflect on, document, and manage their AI use while remaining compliant with university-level ethical and academic standards. Functionally, the system shall offer AI usage logging, assignment-level AI declarations, ethical guidelines, and automated compliance checks against institutional rules (e.g., NTNU), combined with a personal dashboard that visualizes usage patterns over time. From a non-functional perspective, the application emphasizes transparency, explainability, privacy-aware data handling, and usability, ensuring that AI support strengthens learning rather than replacing student responsibility.';

    fireEvent.change(screen.getByLabelText(/purpose of ai usage/i), { target: { value: longPurpose } });
    fireEvent.change(screen.getByLabelText(/ai-generated content/i), { target: { value: 'this is an example content.' } });

    fireEvent.click(screen.getByRole('button', { name: /submit declaration/i }));

    await waitFor(() => {
      expect((axios.post as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalled();
    });

    expect(screen.queryByText(/please enter your name/i)).toBeNull();
    expect(screen.queryByText(/please enter the assignment title/i)).toBeNull();
    expect(screen.queryByText(/please select at least one ai tool/i)).toBeNull();
    expect(screen.queryByText(/please describe the purpose of ai usage/i)).toBeNull();
    expect(screen.queryByText(/please describe the ai-generated content/i)).toBeNull();
  });
});
