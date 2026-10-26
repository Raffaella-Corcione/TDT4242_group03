// tests/App.root-route.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

// Mock BrowserRouter → use MemoryRouter internally
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: any) =>
      <actual.MemoryRouter initialEntries={['/']}>{children}</actual.MemoryRouter>,
  };
});

// Mock child pages (unit test style)
vi.mock('../client/src/pages/HomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="home">HOME PAGE MOCK</div>,
}));

vi.mock('../client/src/pages/DeclarationFormPage', () => ({
  __esModule: true,
  default: () => <div data-testid="decl">DECL PAGE MOCK</div>,
}));

import App from '../client/src/App';

describe('App routing "/"', () => {
  it('renders HomePage at root route', () => {
    render(<App />);
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });
});