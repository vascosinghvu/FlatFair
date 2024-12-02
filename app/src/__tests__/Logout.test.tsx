import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Logout from '../pages/Logout';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Logout Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Set up localStorage with a token
    localStorage.setItem('token', 'test-token');
  });

  test('removes token from localStorage and displays success message', () => {
    render(
      <BrowserRouter>
        <Logout />
      </BrowserRouter>
    );

    // Check if token was removed
    expect(localStorage.getItem('token')).toBeNull();

    // Check if success message is displayed
    expect(screen.getByText('Logout Success!')).toBeInTheDocument();
    expect(screen.getByText('You have been successfully logged out.')).toBeInTheDocument();
  });

  test('navigates to login page when login button is clicked', () => {
    render(
      <BrowserRouter>
        <Logout />
      </BrowserRouter>
    );

    // Click the login button
    fireEvent.click(screen.getByText('Login'));

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
}); 