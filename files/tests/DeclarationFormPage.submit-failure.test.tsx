// tests/DeclarationFormPage.unit.submit-failure.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('axios', () => ({ default: { post: vi.fn() } }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import DeclarationFormPage from '../client/src/pages/DeclarationFormPage';

const fillRequiredBase = () => {
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Mario' } });
  fireEvent.change(screen.getByLabelText(/assignment title/i), { target: { value: 'Assignment 1' } });
  fireEvent.click(screen.getByText('ChatGPT'));
  fireEvent.change(screen.getByLabelText(/purpose of ai usage/i), { target: { value: 'purpose' } });
  fireEvent.change(screen.getByLabelText(/ai-generated content/i), { target: { value: 'content' } });
};

describe('DeclarationFormPage: submit failure path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.post as any).mockRejectedValue({ response: { data: { message: 'Boom' } } });
  });

  it('renders server error from catch block', async () => {
    render(<MemoryRouter><DeclarationFormPage /></MemoryRouter>);
    fillRequiredBase();
    fireEvent.click(screen.getByRole('button', { name: /submit declaration/i }));

    // Catch path sets error to message from backend
    expect(await screen.findByText(/boom/i)).toBeInTheDocument();
  });
});