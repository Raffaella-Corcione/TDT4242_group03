// tests/HomePage.success-grouping.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
import axios from 'axios';

import { MemoryRouter } from 'react-router-dom';
import HomePage from '../client/src/pages/HomePage';

const now = new Date('2025-02-03T10:30:00.000Z').toISOString();

const sample = [
  {
    id: 1,
    user_name: 'Mario',
    assignment_title: 'Assignment 1',
    ai_tool: 'ChatGPT',
    usage_purpose: 'summary',
    ai_content: 'a paragraph',
    created_at: now,
    screenshot_path: null
  },
  {
    id: 2,
    user_name: 'Mario',
    assignment_title: 'Assignment 1',
    ai_tool: 'Claude',
    usage_purpose: 'summary',
    ai_content: 'a paragraph',
    created_at: now,
    screenshot_path: null
  }
];

describe('HomePage: success with grouping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.get as any).mockResolvedValue({
      data: { success: true, data: sample }
    });
  });

  it('groups declarations and displays data correctly', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/submitted declarations \(1\)/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /assignment 1/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/chatgpt/i)).toBeInTheDocument();
    expect(screen.getByText(/claude/i)).toBeInTheDocument();

    expect(screen.getByText(/mario/i)).toBeInTheDocument();

    // Lightly assert date is rendered (month/year part depending on locale)
    expect(screen.getByText(/2025|feb|february/i)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /purpose/i })).toBeInTheDocument();
    expect(screen.getByText(/summary/i)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /ai-generated content/i })).toBeInTheDocument();
    expect(screen.getByText(/a paragraph/i)).toBeInTheDocument();
  });
});