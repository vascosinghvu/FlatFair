import { render, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Auth0
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    user: { name: 'Test User' },
    logout: jest.fn(),
  }),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders navbar with logo', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Flat')).toBeInTheDocument();
    expect(screen.getByText('Fare')).toBeInTheDocument();
  });

  test('does not render navigation links when not logged in', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('renders navigation links and handles clicks when logged in', () => {
    // Set logged in state
    localStorage.setItem('token', 'test-token');
    
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    // Check if links are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Test Home navigation
    fireEvent.click(screen.getByText('Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    
    // Test Logout navigation
    fireEvent.click(screen.getByText('Logout'));
    expect(mockNavigate).toHaveBeenCalledWith('/logout');
  });

  test('console logs login status', () => {
    // Mock console.log
    const consoleSpy = jest.spyOn(console, 'log');
    
    // Test when logged out
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(consoleSpy).toHaveBeenCalledWith('Is logged in:', false);
    
    // Test when logged in
    localStorage.setItem('token', 'test-token');
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(consoleSpy).toHaveBeenCalledWith('Is logged in:', true);
    
    consoleSpy.mockRestore();
  });
}); 