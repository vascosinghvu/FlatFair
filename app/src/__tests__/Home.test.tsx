import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Home Component', () => {
  const mockUserData = {
    currentUser: {
      name: 'Charlotte Conze',
      email: 'charlotte.j.conze@vanderbilt.edu',
      phone: '111-111-1111',
      groups: [
        {
          _id: 'group1',
          groupName: 'Test Group 1',
          members: [
            { _id: '1', name: 'Member 1' },
            { _id: '2', name: 'Member 2' }
          ]
        },
        {
          _id: 'group2',
          groupName: 'Test Group 2',
          members: [
            { _id: '3', name: 'Member 3' },
            { _id: '4', name: 'Member 4' }
          ]
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  test('renders user information and transactions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData)
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Check user info rendering
    expect(screen.getByText('Charlotte Conze')).toBeInTheDocument();
    expect(screen.getByText('charlotte.j.conze@vanderbilt.edu')).toBeInTheDocument();
    expect(screen.getByText('111-111-1111')).toBeInTheDocument();

    // Check transactions rendering
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    expect(screen.getByText('Maria Lopez')).toBeInTheDocument();
    expect(screen.getByText('Class Group 3')).toBeInTheDocument();
  });

  test('handles navigation correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData)
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Test Edit Profile navigation
    fireEvent.click(screen.getByText('Edit Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');

    // Test Create Group navigation
    fireEvent.click(screen.getByText('Create Group'));
    expect(mockNavigate).toHaveBeenCalledWith('/create-group');

    // Test Group Management navigation
    await waitFor(() => {
      const manageGroupButtons = screen.getAllByText('Manage Group');
      fireEvent.click(manageGroupButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/group/group1');
    });
  });

  test('handles API error correctly', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching user info:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles non-OK API response', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching user info:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('formats time correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData)
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Check various time formats
    expect(screen.getByText('10:54 PM')).toBeInTheDocument(); // Alex Johnson's transaction
    expect(screen.getByText('9:30 PM')).toBeInTheDocument(); // Maria Lopez's transaction
  });

  test('displays transaction status with correct styling', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData)
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const pendingStatuses = screen.getAllByText('Pending');
    const completedStatuses = screen.getAllByText('Completed');

    pendingStatuses.forEach(status => {
      expect(status.className).toContain('Badge-color--yellow-1000');
    });

    completedStatuses.forEach(status => {
      expect(status.className).toContain('Badge-color--purple-1000');
    });
  });

  test('handles console logging', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData)
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('User Info:', expect.any(Object));
      expect(consoleLogSpy).toHaveBeenCalledWith('CURRENT USER: ', expect.any(Object));
      expect(consoleLogSpy).toHaveBeenCalledWith('CURRENT USER INFO:', expect.any(Object));
      expect(consoleLogSpy).toHaveBeenCalledWith('CURRENT USER GROUPS:', expect.any(Array));
    });

    consoleLogSpy.mockRestore();
  });

  test('handles undefined groups in user data', async () => {
    const mockUserDataNoGroups = {
      currentUser: {
        ...mockUserData.currentUser,
        groups: undefined
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserDataNoGroups)
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create Group')).toBeInTheDocument();
      expect(screen.queryByText('Manage Group')).not.toBeInTheDocument();
    });
  });

  test('handles null user data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ currentUser: null })
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create Group')).toBeInTheDocument();
      expect(screen.queryByText('Manage Group')).not.toBeInTheDocument();
    });
  });

  test('formats time with single-digit hours and minutes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData)
    });

    const testTransactions = [
      {
        timestamp: new Date("2024-10-20T09:05:00"), // 9:05 AM
        name: "Test User 1",
        group: "Test Group",
        amount: 50,
        status: "Pending"
      },
      {
        timestamp: new Date("2024-10-20T23:05:00"), // 11:05 PM
        name: "Test User 2",
        group: "Test Group",
        amount: 50,
        status: "Completed"
      }
    ];

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('9:05 AM')).toBeInTheDocument();
      expect(screen.getByText('11:05 PM')).toBeInTheDocument();
    });
  });

  test('handles undefined members in group', async () => {
    const mockUserDataWithUndefinedMember = {
      currentUser: {
        ...mockUserData.currentUser,
        groups: [{
          _id: 'group1',
          groupName: 'Test Group',
          members: [
            { _id: '1', name: 'Member 1' },
            undefined,
            { _id: '2', name: 'Member 2' }
          ]
        }]
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserDataWithUndefinedMember)
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Member 1, Member 2')).toBeInTheDocument();
    });
  });

  test('handles empty members array in group', async () => {
    const mockUserDataWithEmptyMembers = {
      currentUser: {
        ...mockUserData.currentUser,
        groups: [{
          _id: 'group1',
          groupName: 'Empty Group',
          members: []
        }]
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserDataWithEmptyMembers)
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Empty Group')).toBeInTheDocument();
      expect(screen.getByText('')).toBeInTheDocument(); // Empty members string
    });
  });
}); 