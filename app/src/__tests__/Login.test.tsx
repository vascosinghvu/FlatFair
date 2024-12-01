import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { api } from '../api';

// Mock the api module
jest.mock('../api', () => ({
  api: {
    post: jest.fn()
  }
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  });

  test('renders login form elements', () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/create one/i)).toBeInTheDocument();
  });

  test('displays validation errors for empty fields', async () => {
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  test('validates password length', async () => {
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, '12345');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid credentials', async () => {
    const mockToken = 'mock-token-123';
    (api.post as jest.Mock).mockResolvedValueOnce({ token: mockToken });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/user/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles login failure', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Login failed'));

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('disables submit button while loading', async () => {
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Type valid credentials
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    // Mock a slow API response
    (api.post as jest.Mock).mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => resolve({ token: 'mock-token' }), 1000);
    }));

    fireEvent.click(submitButton);
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId('async-submit')).toBeInTheDocument();
  });

  test('navigates to create account page', () => {
    const createAccountLink = screen.getByText(/create one/i);
    expect(createAccountLink).toHaveAttribute('href', '/create-account');
  });

  test('shows validation errors when submitting empty form', async () => {
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('stores token and navigates on successful login', async () => {
    const mockToken = 'test-token';
    (api.post as jest.Mock).mockResolvedValueOnce({ token: mockToken });

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('displays error message on login failure', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Login failed'));

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });
}); 