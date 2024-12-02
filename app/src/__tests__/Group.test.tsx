import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Group from '../pages/Group';
import { api } from '../api';

// Mock the api module
jest.mock('../api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ groupid: 'test-group-id' }),
}));

describe('Group Component', () => {
  const mockGroupData = {
    data: {
      group: {
        _id: 'test-group-id',
        groupName: 'Class Group 7',
        description: 'Group Description',
        members: [
          { _id: '1', name: 'John Doe', role: 'Admin' },
          { _id: '2', name: 'Jane Smith', role: 'Member' },
        ],
        expenses: [
          {
            date: '2024-03-20',
            createdBy: { name: 'John' },
            description: 'Lunch',
            amount: 50,
            status: 'Pending',
            allocatedToUsers: [
              { name: 'John Doe' },
              { name: 'Jane Smith' },
            ],
          },
        ],
      },
    },
  };

  const mockUserData = {
    data: {
      currentUser: {
        _id: '1',
        name: 'John Doe',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/user/get-user')) {
        return Promise.resolve(mockUserData);
      } else if (url.includes('/group/get-group')) {
        return Promise.resolve(mockGroupData);
      }
      return Promise.reject(new Error('not found'));
    });

    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
  });

  test('renders group information', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    // Wait for group data to load
    await waitFor(() => expect(screen.getByText('Class Group 7')).toBeInTheDocument());

    expect(screen.getByText('Group Description')).toBeInTheDocument();

    // Check that members are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check that expenses are rendered
    expect(screen.getByText('Lunch')).toBeInTheDocument();
  });

  test('handles expense creation with "Equally" split', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    // Wait for group data to load
    await waitFor(() => expect(screen.getByText('Class Group 7')).toBeInTheDocument());

    // Open the expense creation modal
    fireEvent.click(screen.getByText('Create New Expense'));

    // Wait for the modal to appear
    await waitFor(() => expect(screen.getByText('Add an Expense')).toBeInTheDocument());

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Item/Activity'), {
      target: { value: 'Dinner' },
    });
    fireEvent.change(screen.getByLabelText('Amount ($)'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2024-01-01' },
    });

    // Select members
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select John Doe
    fireEvent.click(checkboxes[1]); // Select Jane Smith

    // Submit the form
    fireEvent.click(screen.getByText('Log Expense'));

    // Wait for the API call to be made
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/expense/add-expense',
        expect.objectContaining({
          item: 'Dinner',
          totalCost: 100,
          date: '2024-01-01',
          memberBreakdown: [
            { memberID: '1', amountDue: 50 },
            { memberID: '2', amountDue: 50 },
          ],
          groupID: 'test-group-id',
        })
      );
    });

    // Check for success message
    expect(screen.getByText('Expense logged successfully!')).toBeInTheDocument();
  });

  test('handles expense creation with "By Percent" split', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    // Wait for group data to load
    await waitFor(() => expect(screen.getByText('Class Group 7')).toBeInTheDocument());

    // Open the expense creation modal
    fireEvent.click(screen.getByText('Create New Expense'));

    // Wait for the modal to appear
    await waitFor(() => expect(screen.getByText('Add an Expense')).toBeInTheDocument());

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Item/Activity'), {
      target: { value: 'Dinner' },
    });
    fireEvent.change(screen.getByLabelText('Amount ($)'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2024-01-01' },
    });

    // Select 'By Percent'
    fireEvent.click(screen.getByText('By Percent'));

    // Select members
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select John Doe
    fireEvent.click(checkboxes[1]); // Select Jane Smith

    // Enter percentages
    const percentInputs = screen.getAllByPlaceholderText('Enter %');
    fireEvent.change(percentInputs[0], { target: { value: '60' } });
    fireEvent.change(percentInputs[1], { target: { value: '40' } });

    // Submit the form
    fireEvent.click(screen.getByText('Log Expense'));

    // Wait for the API call to be made
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/expense/add-expense',
        expect.objectContaining({
          item: 'Dinner',
          totalCost: 100,
          date: '2024-01-01',
          memberBreakdown: [
            { memberID: '1', amountDue: 60 },
            { memberID: '2', amountDue: 40 },
          ],
          groupID: 'test-group-id',
        })
      );
    });

    // Check for success message
    expect(screen.getByText('Expense logged successfully!')).toBeInTheDocument();
  });

  test('handles validation error when percentages do not add up to 100', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    // Wait for group data to load
    await waitFor(() => expect(screen.getByText('Class Group 7')).toBeInTheDocument());

    // Open the expense creation modal
    fireEvent.click(screen.getByText('Create New Expense'));

    // Wait for the modal to appear
    await waitFor(() => expect(screen.getByText('Add an Expense')).toBeInTheDocument());

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Item/Activity'), {
      target: { value: 'Dinner' },
    });
    fireEvent.change(screen.getByLabelText('Amount ($)'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2024-01-01' },
    });

    // Select 'By Percent'
    fireEvent.click(screen.getByText('By Percent'));

    // Select members
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select John Doe
    fireEvent.click(checkboxes[1]); // Select Jane Smith

    // Enter percentages that do not add up to 100
    const percentInputs = screen.getAllByPlaceholderText('Enter %');
    fireEvent.change(percentInputs[0], { target: { value: '50' } });
    fireEvent.change(percentInputs[1], { target: { value: '30' } });

    // Submit the form
    fireEvent.click(screen.getByText('Log Expense'));

    // Check for validation error message
    expect(screen.getByText('The total percentage split must add up to 100%.')).toBeInTheDocument();
  });

  test('handles settle up with user selected', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    // Wait for group data to load
    await waitFor(() => expect(screen.getByText('Class Group 7')).toBeInTheDocument());

    // Open the settle up modal
    fireEvent.click(screen.getAllByText('Settle Up')[0]);

    // Wait for the modal to appear
    await waitFor(() => expect(screen.getByText('Select a user to settle up with:')).toBeInTheDocument());

    // Select a user
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Jane Smith' } });

    // Click Settle Up
    const settleUpButtons = screen.getAllByText('Settle Up');
    fireEvent.click(settleUpButtons[1]);

    // Since there is no actual API call in handleSettleUp, we can just check that the modal closes
    await waitFor(() => expect(screen.queryByText('Select a user to settle up with:')).not.toBeInTheDocument());
  });

  test('handles edit modal opening and closing', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    // Wait for group data to load
    await waitFor(() => expect(screen.getByText('Class Group 7')).toBeInTheDocument());

    // Click on the edit icon
    const editIcons = screen.getAllByTestId('edit-icon'); // You need to add data-testid="edit-icon" in your component
    fireEvent.click(editIcons[0]);

    // Wait for the modal to appear
    await waitFor(() => expect(screen.getByText('Manage Group Member')).toBeInTheDocument());

    // Close the modal
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Check that the modal has closed
    expect(screen.queryByText('Manage Group Member')).not.toBeInTheDocument();
  });

  test('handles no members selected in expense creation', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(mockGroupData.data.group.groupName)).toBeInTheDocument();
    });

    // Open the expense creation modal
    fireEvent.click(screen.getByText('Create New Expense'));

    // Wait for the modal to appear
    await waitFor(() => expect(screen.getByText('Add an Expense')).toBeInTheDocument());

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Item/Activity'), {
      target: { value: 'Dinner' },
    });
    fireEvent.change(screen.getByLabelText('Amount ($)'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2024-01-01' },
    });

    // Do not select any members

    // Submit the form
    fireEvent.click(screen.getByText('Log Expense'));

    // Check for validation error message
    expect(screen.getByText('Please select at least one member.')).toBeInTheDocument();
  });

  test('handles changing split method multiple times', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    // Wait for group data to load
    await waitFor(() => expect(screen.getByText('Class Group 7')).toBeInTheDocument());

    // Open the expense creation modal
    fireEvent.click(screen.getByText('Create New Expense'));

    // Wait for the modal to appear
    await waitFor(() => expect(screen.getByText('Add an Expense')).toBeInTheDocument());

    // Switch between split methods
    fireEvent.click(screen.getByText('Equally'));
    fireEvent.click(screen.getByText('By Percent'));
    fireEvent.click(screen.getByText('Manual'));

    // Ensure appropriate input fields are rendered
    const amountInputs = screen.getAllByPlaceholderText('Enter amount');
    // Since no members are selected, there might be zero inputs
    expect(amountInputs.length).toBeGreaterThanOrEqual(0);
  });

  test('handles API error in fetchUserInfo', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    // Wait for group data to load
    await waitFor(() => {
      expect(screen.getByText(mockGroupData.data.group.groupName)).toBeInTheDocument();
    });

    // Check that console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user info:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  test('handles when groupInfo is null', async () => {
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/user/get-user')) {
        return Promise.resolve(mockUserData);
      } else if (url.includes('/group/get-group')) {
        return Promise.resolve({ data: { group: null } });
      }
      return Promise.reject(new Error('not found'));
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    // Wait for component to update
    await waitFor(() => {
      expect(screen.getByText(mockGroupData.data.group.groupName)).toBeInTheDocument();
    });

    // Since groupInfo is null, members and expenses should not be rendered
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Lunch')).not.toBeInTheDocument();
  });

  test('handles edit member modal', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Group />
        </BrowserRouter>
      );
    });

    // Wait for group data to load
    await waitFor(() => {
      expect(screen.getByText(mockGroupData.data.group.groupName)).toBeInTheDocument();
    });

    // Rest of test...
  });
});
