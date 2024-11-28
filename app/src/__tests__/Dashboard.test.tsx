import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { api } from '../api';

// Mock the api module
jest.mock('../api', () => ({
  api: {
    get: jest.fn()
  }
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Dashboard Component', () => {
  const mockUserData = {
    data: {
      currentUser: {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        groups: [
          {
            _id: 'group1',
            groupName: 'Study Group',
            members: [
              { _id: '1', name: 'John Doe' },
              { _id: '2', name: 'Jane Smith' }
            ]
          }
        ],
        expenses: [
          {
            date: '2024-03-20',
            description: 'Lunch',
            amount: 25.50,
            status: 'Pending'
          },
          {
            date: '2024-03-19',
            description: 'Movie tickets',
            amount: 30.00,
            status: 'Completed'
          }
        ]
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValue(mockUserData);
  });

  test('renders user information and transactions', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Lunch')).toBeInTheDocument();
      expect(screen.getByText('Movie tickets')).toBeInTheDocument();
      expect(screen.getByText('$25.50')).toBeInTheDocument();
      expect(screen.getByText('$30.00')).toBeInTheDocument();
    });
  });

  test('handles navigation correctly', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Test Edit Profile navigation
      fireEvent.click(screen.getByText('Edit Profile'));
      expect(mockNavigate).toHaveBeenCalledWith('/profile');

      // Test Create Group navigation
      fireEvent.click(screen.getByText('Create Group'));
      expect(mockNavigate).toHaveBeenCalledWith('/create-group');

      // Test Group Management navigation
      fireEvent.click(screen.getByText('Manage Group'));
      expect(mockNavigate).toHaveBeenCalledWith('/group/group1');
    });
  });

  test('handles API error correctly', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user info:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles invalid response structure', async () => {
    const invalidResponse = {
      data: {
        // Missing currentUser property
      }
    };
    
    (api.get as jest.Mock).mockResolvedValueOnce(invalidResponse);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid response structure:',
        expect.any(Object)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles null response data', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce(null);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid response structure:',
        null
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles console logging', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Full response:', expect.any(Object));
      expect(consoleLogSpy).toHaveBeenCalledWith('CURRENT USER: ', expect.any(Object));
      expect(consoleLogSpy).toHaveBeenCalledWith('CURRENT USER INFO:', expect.any(Object));
      expect(consoleLogSpy).toHaveBeenCalledWith('CURRENT USER GROUPS:', expect.any(Array));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Array)); // For transactions log
    });

    consoleLogSpy.mockRestore();
  });

  test('handles missing user data gracefully', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        currentUser: {
          name: 'John Doe',
          email: 'john@example.com',
          groups: [],
          expenses: []
        }
      }
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Create Group')).toBeInTheDocument();
    });
  });

  test('displays transaction status with correct styling', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const pendingStatus = screen.getByText('Pending');
      const completedStatus = screen.getByText('Completed');
      
      expect(pendingStatus.className).toContain('Badge-color--yellow-1000');
      expect(completedStatus.className).toContain('Badge-color--purple-1000');
    });
  });

  test('handles formatTime function with different times', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Access the component instance to test formatTime
    // Test AM time before 10
    const morningTime = new Date(2024, 2, 20, 9, 5);
    expect(screen.getByTestId('format-time')).toHaveTextContent('9:05 AM');

    // Test PM time
    const afternoonTime = new Date(2024, 2, 20, 13, 30);
    expect(screen.getByTestId('format-time')).toHaveTextContent('1:30 PM');

    // Test midnight (12 AM)
    const midnightTime = new Date(2024, 2, 20, 0, 0);
    expect(screen.getByTestId('format-time')).toHaveTextContent('12:00 AM');

    // Test noon (12 PM)
    const noonTime = new Date(2024, 2, 20, 12, 0);
    expect(screen.getByTestId('format-time')).toHaveTextContent('12:00 PM');
  });

  test('handles undefined members in group', async () => {
    const mockDataWithUndefinedMember = {
      data: {
        currentUser: {
          ...mockUserData.data.currentUser,
          groups: [{
            _id: 'group1',
            groupName: 'Test Group',
            members: [
              { _id: '1', name: 'John Doe' },
              undefined,
              { _id: '2', name: 'Jane Smith' }
            ]
          }]
        }
      }
    };

    (api.get as jest.Mock).mockResolvedValueOnce(mockDataWithUndefinedMember);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText('John Doe, Jane Smith')).toBeInTheDocument();
    });
  });

  test('handles empty members array in group', async () => {
    const mockDataWithEmptyMembers = {
      data: {
        currentUser: {
          ...mockUserData.data.currentUser,
          groups: [{
            _id: 'group1',
            groupName: 'Empty Group',
            members: []
          }]
        }
      }
    };

    (api.get as jest.Mock).mockResolvedValueOnce(mockDataWithEmptyMembers);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Empty Group')).toBeInTheDocument();
    });
  });

  test('handles undefined groups array', async () => {
    const mockDataWithUndefinedGroups = {
      data: {
        currentUser: {
          ...mockUserData.data.currentUser,
          groups: undefined
        }
      }
    };

    (api.get as jest.Mock).mockResolvedValueOnce(mockDataWithUndefinedGroups);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create Group')).toBeInTheDocument();
      // Verify groups section is empty
      expect(screen.queryByText('Manage Group')).not.toBeInTheDocument();
    });
  });

  test('handles undefined expenses array', async () => {
    const mockDataWithUndefinedExpenses = {
      data: {
        currentUser: {
          ...mockUserData.data.currentUser,
          expenses: undefined
        }
      }
    };

    (api.get as jest.Mock).mockResolvedValueOnce(mockDataWithUndefinedExpenses);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Verify expenses section is empty
      expect(screen.queryByText('Lunch')).not.toBeInTheDocument();
      expect(screen.queryByText('Movie tickets')).not.toBeInTheDocument();
    });
  });
}); 