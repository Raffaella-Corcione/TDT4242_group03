
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('axios', () => ({ default: { post: vi.fn() } }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

// Mock FileReader so onloadend fires deterministically in JSDOM
class MockFileReader {
  public result: string | ArrayBuffer | null = 'data:image/png;base64,TEST';
  public onloadend: null | (() => void) = null;
  readAsDataURL() {
    if (this.onloadend) this.onloadend();
  }
}
(global as any).FileReader = MockFileReader;

import { MemoryRouter } from 'react-router-dom';
import DeclarationFormPage from '../client/src/pages/DeclarationFormPage';

const fillRequiredBase = () => {
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Mario' } });
  fireEvent.change(screen.getByLabelText(/assignment title/i), { target: { value: 'Assignment 1' } });
  fireEvent.click(screen.getByText('ChatGPT'));
  fireEvent.change(screen.getByLabelText(/purpose of ai usage/i), { target: { value: 'purpose' } });
  fireEvent.change(screen.getByLabelText(/ai-generated content/i), { target: { value: 'content' } });
};

describe('DeclarationFormPage: preview & remove screenshot', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders preview after valid image and removes it on click', async () => {
    render(<MemoryRouter><DeclarationFormPage /></MemoryRouter>);

    fillRequiredBase();

    const blob = new Blob([new Uint8Array(1024)], { type: 'image/png' });
    const file = new File([blob], 'ok.png', { type: 'image/png' });

    const fileInput = screen.getByLabelText(/screenshot|screenshot\/example/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Preview branch (lines ~140–141) is rendered
    const img = await screen.findByAltText(/preview/i);
    expect(img).toBeInTheDocument();

    // Click ✕ Remove → removeScreenshot (lines ~144–145)
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    await waitFor(() => {
      expect(screen.queryByAltText(/preview/i)).toBeNull();
      expect(screen.getByLabelText(/screenshot|screenshot\/example/i)).toBeInTheDocument();
    });
  });
});
