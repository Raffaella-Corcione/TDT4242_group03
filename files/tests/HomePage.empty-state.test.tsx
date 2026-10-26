// tests/HomePage.empty-state.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
import axios from 'axios';

import { MemoryRouter } from 'react-router-dom';
import HomePage from '../client/src/pages/HomePage';

describe('HomePage: empty state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.get as any).mockResolvedValue({ data: { success: true, data: [] } });
  });

  it('shows empty state when server returns empty list', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { name: /no declarations yet/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/submitted declarations \(0\)/i)
    ).toBeInTheDocument();
  });
});
``