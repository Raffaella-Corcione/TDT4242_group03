// tests/App.link-navigation.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: any) =>
      <actual.MemoryRouter initialEntries={['/']}>{children}</actual.MemoryRouter>,
  };
});

// Use real Link navigation
import { Link } from 'react-router-dom';

vi.mock('../client/src/pages/HomePage', () => ({
  __esModule: true,
  default: () => (
    <div>
      <h1>HOME PAGE MOCK</h1>
      <Link to="/new-declaration">Create New Declaration</Link>
    </div>
  ),
}));

vi.mock('../client/src/pages/DeclarationFormPage', () => ({
  __esModule: true,
  default: () => <div data-testid="decl">DECL PAGE MOCK</div>,
}));

import App from '../client/src/App';

describe('App routing: navigation via Link', () => {
  it('navigates to form page when clicking link', async () => {
    render(<App />);

    fireEvent.click(screen.getByText(/create new declaration/i));

    expect(await screen.findByTestId('decl')).toBeInTheDocument();
  });
});