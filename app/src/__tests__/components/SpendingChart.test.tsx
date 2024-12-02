import { render, screen } from '@testing-library/react';
import SpendingChart from '../../components/SpendingChart';
import { IExpense } from '../../types';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('SpendingChart Component', () => {
  const mockTransactions: IExpense[] = [
    {
      _id: '1',
      date: new Date('2024-01-15'),
      amount: 50.00,
      description: 'Test expense 1',
      status: 'Pending',
      createdBy: { _id: 'user1', name: 'John' },
      group: { _id: 'group1', groupName: 'Test Group', members: [] },
      category: 'Food',
      statusMap: new Map(),
      receipt: new File([], 'test.jpg'),
      allocatedTo: new Map(),
      allocatedToUsers: []
    }
  ];

  beforeEach(() => {
    // Set up a container with dimensions
    const div = document.createElement('div');
    div.style.width = '500px';
    div.style.height = '500px';
    document.body.appendChild(div);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders and processes data correctly', () => {
    const { container } = render(
      <div style={{ width: '500px', height: '500px' }}>
        <SpendingChart transactions={mockTransactions} />
      </div>
    );
    
    expect(screen.getByText('User Spending by Month')).toBeInTheDocument();
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });
}); 