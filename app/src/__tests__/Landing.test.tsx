import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from '../pages/Landing';

describe('Landing Page', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );
  });

  test('renders welcome message', () => {
    expect(screen.getByText('Welcome to FlatFair')).toBeInTheDocument();
  });

  test('renders login button', () => {
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
}); 