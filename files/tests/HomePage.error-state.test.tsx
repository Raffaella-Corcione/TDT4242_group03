// tests/HomePage.error-state.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
import axios from 'axios';

import { MemoryRouter } from 'react-router-dom';
import HomePage from '../client/src/pages/HomePage';

describe('HomePage: error state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.get as any).mockRejectedValue(new Error('Network fail'));
  });

  it('shows the error banner when request fails', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/failed to connect to the server/i)
    ).toBeInTheDocument();

    expect(screen.queryByText(/loading declarations/i)).toBeNull();
  });
});