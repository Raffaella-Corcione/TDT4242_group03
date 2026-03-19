// tests/HomePage.retry-refetch.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
import axios from 'axios';

import { MemoryRouter } from 'react-router-dom';
import HomePage from '../client/src/pages/HomePage';

describe('HomePage: retry triggers refetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error first, then loads data on retry', async () => {
    (axios.get as any)
      .mockRejectedValueOnce(new Error('fail1'))
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              id: 1,
              user_name: 'Peach',
              assignment_title: 'Thesis',
              ai_tool: 'ChatGPT',
              usage_purpose: 'drafting',
              ai_content: 'outline',
              created_at: new Date('2025-03-05T09:00:00.000Z').toISOString(),
              screenshot_path: null
            }
          ]
        }
      });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/failed to connect to the server/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(
      await screen.findByRole('heading', { name: /thesis/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/submitted declarations \(1\)/i)
    ).toBeInTheDocument();
  });
});