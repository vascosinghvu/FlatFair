import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';
import CreateAccount from '../pages/CreateAccount';
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

describe('CreateAccount Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    act(() => {
      render(
        <BrowserRouter>
          <CreateAccount />
        </BrowserRouter>
      );
    });
  });

  test('renders all form fields and submit button', () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('displays validation errors for empty fields', async () => {
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
      fireEvent.blur(screen.getByLabelText(/email/i));
    });

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  test('validates password length', async () => {
    const passwordInput = screen.getByLabelText(/^password$/i);
    await userEvent.type(passwordInput, '12345');
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  test('validates password match', async () => {
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password456');
    fireEvent.blur(confirmPasswordInput);

    await waitFor(() => {
      expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    (api.post as jest.Mock).mockResolvedValueOnce({ token: 'fake-token' });

    await act(async () => {
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/name/i), 'Test User');
      await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(consoleLogSpy).toHaveBeenCalledWith('Account creation submitted:', expect.any(Object));
      expect(consoleLogSpy).toHaveBeenCalledWith('Account created successfully:', expect.any(Object));
      expect(consoleLogSpy).toHaveBeenCalledWith('Current token:', 'fake-token');
    });

    consoleLogSpy.mockRestore();
  });

  test('handles case where token comes from login', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    (api.post as jest.Mock)
      .mockResolvedValueOnce({}) // create-user response without token
      .mockResolvedValueOnce({ token: 'login-token' }); // login response with token

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('login-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(consoleLogSpy).toHaveBeenCalledWith('Login response:', expect.any(Object));
    });

    consoleLogSpy.mockRestore();
  });

  test('handles API error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('API Error');
    (api.post as jest.Mock).mockRejectedValueOnce(error);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Account creation failed:',
        expect.any(String)
      );
      expect(screen.getByRole('button', { name: /create account/i })).toBeEnabled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles API error with response data', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = { response: { data: 'Detailed error message' } };
    (api.post as jest.Mock).mockRejectedValueOnce(error);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Account creation failed:',
        'Detailed error message'
      );
    });

    consoleErrorSpy.mockRestore();
  });
}); 