// tests/App.new-declaration-route.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: any) =>
      <actual.MemoryRouter initialEntries={['/new-declaration']}>{children}</actual.MemoryRouter>,
  };
});

vi.mock('../client/src/pages/HomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="home">HOME PAGE MOCK</div>,
}));

vi.mock('../client/src/pages/DeclarationFormPage', () => ({
  __esModule: true,
  default: () => <div data-testid="decl">DECL PAGE MOCK</div>,
}));

import App from '../client/src/App';

describe('App routing "/new-declaration"', () => {
  it('renders DeclarationFormPage', () => {
    render(<App />);
    expect(screen.getByTestId('decl')).toBeInTheDocument();
  });
});