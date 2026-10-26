// tests/HomePage.loading-state.test.tsx   <-- NOTE THE .tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
import axios from 'axios';

import { MemoryRouter } from 'react-router-dom';
import HomePage from '../client/src/pages/HomePage';

describe('HomePage: loading state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Loading declarations..." while request is in-flight', async () => {
    let resolveFn!: (v: any) => void;

    (axios.get as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve;
        })
    );

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading declarations/i)).toBeInTheDocument();

    resolveFn({ data: { success: true, data: [] } });
  });
});