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

// Mock SpendingChart component
jest.mock('../components/SpendingChart', () => {
  return function MockSpendingChart({ transactions }: { transactions: any[] }) {
    return <div data-testid="spending-chart">Mock Chart</div>;
  };
});

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
            _id: 'exp1',
            date: '2024-03-20',
            description: 'Lunch',
            amount: 25.50,
            status: 'Pending',
            createdBy: { name: 'John Doe' }
          },
          {
            _id: 'exp2',
            date: '2024-03-19',
            description: 'Movie tickets',
            amount: 30.00,
            status: 'Settled',
            createdBy: { name: 'John Doe' }
          }
        ]
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValue(mockUserData);
  });

  test('renders user information correctly', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  test('filters transactions correctly', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Click settled filter
      fireEvent.click(screen.getByText('Settled'));
      expect(screen.getByText('Movie tickets')).toBeInTheDocument();
      expect(screen.queryByText('Lunch')).not.toBeInTheDocument();

      // Click pending filter
      fireEvent.click(screen.getByText('Pending'));
      expect(screen.getByText('Lunch')).toBeInTheDocument();
      expect(screen.queryByText('Movie tickets')).not.toBeInTheDocument();
    });
  });

  test('opens expense modal on transaction click', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const transaction = screen.getByText('Lunch');
      fireEvent.click(transaction);
      
      expect(screen.getByText('Expense Details')).toBeInTheDocument();
      expect(screen.getByText('$25.50')).toBeInTheDocument();
      expect(screen.getByText('Created By: John Doe')).toBeInTheDocument();
    });
  });

  test('handles group navigation', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const manageGroupButton = screen.getByText('Manage Group');
      fireEvent.click(manageGroupButton);
      expect(mockNavigate).toHaveBeenCalledWith('/group/group1');
    });
  });

  test('handles create group navigation', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const createGroupButton = screen.getByText('Create Group');
      fireEvent.click(createGroupButton);
      expect(mockNavigate).toHaveBeenCalledWith('/create-group');
    });
  });
}); 