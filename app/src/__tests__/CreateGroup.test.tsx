import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CreateGroup from '../pages/CreateGroup';
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

describe('CreateGroup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(
      <BrowserRouter>
        <CreateGroup />
      </BrowserRouter>
    );
  });

  test('validates required fields', async () => {
    const submitButton = screen.getByText('Create Group');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a group name/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a group description/i)).toBeInTheDocument();
    });
  });

  test('validates email format when adding member', async () => {
    const emailInput = screen.getByLabelText(/invite group members/i);
    const addButton = screen.getByText('Add');

    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  test('successfully adds member email', async () => {
    const emailInput = screen.getByLabelText(/invite group members/i);
    const addButton = screen.getByText('Add');

    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  test('submits form with valid data and members', async () => {
    // Fill in required fields
    const nameInput = screen.getByLabelText(/group name/i);
    const descInput = screen.getByLabelText(/group description/i);
    const emailInput = screen.getByLabelText(/invite group members/i);
    const addButton = screen.getByText('Add');

    await userEvent.type(nameInput, 'Test Group');
    await userEvent.type(descInput, 'Test Description');
    await userEvent.type(emailInput, 'member@example.com');
    fireEvent.click(addButton);

    // Mock successful API response
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { groupId: '123' } });

    // Submit form
    const submitButton = screen.getByText('Create Group');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/group/create-group', {
        groupName: 'Test Group',
        groupDescription: 'Test Description',
        members: ['member@example.com']
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles API error during submission', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Fill in required fields
    const nameInput = screen.getByLabelText(/group name/i);
    const descInput = screen.getByLabelText(/group description/i);
    const emailInput = screen.getByLabelText(/invite group members/i);
    const addButton = screen.getByText('Add');

    await userEvent.type(nameInput, 'Test Group');
    await userEvent.type(descInput, 'Test Description');
    await userEvent.type(emailInput, 'member@example.com');
    fireEvent.click(addButton);

    // Mock API error
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    // Submit form
    const submitButton = screen.getByText('Create Group');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('prevents duplicate member emails', async () => {
    const emailInput = screen.getByLabelText(/invite group members/i);
    const addButton = screen.getByText('Add');

    // Add email first time
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(addButton);

    // Try to add same email again
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(addButton);

    const emailElements = screen.getAllByText('test@example.com');
    expect(emailElements).toHaveLength(1);
  });

  test('clears form after successful submission', async () => {
    // Fill in required fields
    const nameInput = screen.getByLabelText(/group name/i);
    const descInput = screen.getByLabelText(/group description/i);
    const emailInput = screen.getByLabelText(/invite group members/i);
    const addButton = screen.getByText('Add');

    await userEvent.type(nameInput, 'Test Group');
    await userEvent.type(descInput, 'Test Description');
    await userEvent.type(emailInput, 'member@example.com');
    fireEvent.click(addButton);

    // Mock successful API response
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { groupId: '123' } });

    // Submit form
    const submitButton = screen.getByText('Create Group');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(descInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
      expect(screen.queryByText('member@example.com')).not.toBeInTheDocument();
    });
  });

  test('handles form submission with no members added', async () => {
    const nameInput = screen.getByLabelText(/group name/i);
    const descInput = screen.getByLabelText(/group description/i);

    await userEvent.type(nameInput, 'Test Group');
    await userEvent.type(descInput, 'Test Description');

    const submitButton = screen.getByText('Create Group');
    expect(submitButton).toBeDisabled();
  });

  test('validates empty email when adding member', async () => {
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    // Should not add empty email to members list
    expect(screen.queryByText('•')).not.toBeInTheDocument();
  });

  test('handles API error with response data', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorResponse = { response: { data: 'Detailed error message' } };
    (api.post as jest.Mock).mockRejectedValueOnce(errorResponse);

    // Fill form
    await userEvent.type(screen.getByLabelText(/group name/i), 'Test Group');
    await userEvent.type(screen.getByLabelText(/group description/i), 'Test Description');
    await userEvent.type(screen.getByLabelText(/invite group members/i), 'test@example.com');
    fireEvent.click(screen.getByText('Add'));

    // Submit form
    fireEvent.click(screen.getByText('Create Group'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating group:',
        'Detailed error message'
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles success state after submission', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { groupId: '123' } });

    // Fill form
    await userEvent.type(screen.getByLabelText(/group name/i), 'Test Group');
    await userEvent.type(screen.getByLabelText(/group description/i), 'Test Description');
    await userEvent.type(screen.getByLabelText(/invite group members/i), 'test@example.com');
    fireEvent.click(screen.getByText('Add'));

    // Submit form
    fireEvent.click(screen.getByText('Create Group'));

    await waitFor(() => {
      expect(screen.getByText('Group successfully created')).toBeInTheDocument();
    });
  });

  test('validates groupMemberEmail when members exist', async () => {
    // Add a member first
    await userEvent.type(screen.getByLabelText(/invite group members/i), 'test@example.com');
    fireEvent.click(screen.getByText('Add'));

    // Try to add invalid email
    await userEvent.type(screen.getByLabelText(/invite group members/i), 'invalid-email');
    
    // Submit form
    const submitButton = screen.getByText('Create Group');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  test('handles loading state during submission', async () => {
    // Mock slow API response
    (api.post as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    // Fill form
    await userEvent.type(screen.getByLabelText(/group name/i), 'Test Group');
    await userEvent.type(screen.getByLabelText(/group description/i), 'Test Description');
    await userEvent.type(screen.getByLabelText(/invite group members/i), 'test@example.com');
    fireEvent.click(screen.getByText('Add'));

    // Submit form
    fireEvent.click(screen.getByText('Create Group'));

    // Check loading state
    expect(screen.getByRole('button', { name: /create group/i })).toBeDisabled();
  });

  test('handles multiple member additions and displays separator', async () => {
    const emailInput = screen.getByLabelText(/invite group members/i);
    const addButton = screen.getByText('Add');

    // Add multiple members
    await userEvent.type(emailInput, 'test1@example.com');
    fireEvent.click(addButton);
    await userEvent.type(emailInput, 'test2@example.com');
    fireEvent.click(addButton);

    // Check for separator between emails
    expect(screen.getByText('•')).toBeInTheDocument();
    expect(screen.getByText('test1@example.com')).toBeInTheDocument();
    expect(screen.getByText('test2@example.com')).toBeInTheDocument();
  });

  test('handles form validation with existing members but invalid email', async () => {
    // Add a valid member first
    await userEvent.type(screen.getByLabelText(/invite group members/i), 'valid@example.com');
    fireEvent.click(screen.getByText('Add'));

    // Fill required fields
    await userEvent.type(screen.getByLabelText(/group name/i), 'Test Group');
    await userEvent.type(screen.getByLabelText(/group description/i), 'Test Description');

    // Add invalid email
    await userEvent.type(screen.getByLabelText(/invite group members/i), 'invalid-email');

    // Submit form
    const submitButton = screen.getByText('Create Group');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  test('handles form dirty state correctly', async () => {
    const submitButton = screen.getByText('Create Group');
    expect(submitButton).toBeDisabled();

    // Make form dirty with valid data
    await userEvent.type(screen.getByLabelText(/group name/i), 'Test Group');
    await userEvent.type(screen.getByLabelText(/group description/i), 'Test Description');
    await userEvent.type(screen.getByLabelText(/invite group members/i), 'test@example.com');
    fireEvent.click(screen.getByText('Add'));

    expect(submitButton).not.toBeDisabled();
  });

  test('handles console log in finally block', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Fill form with valid data
    await userEvent.type(screen.getByLabelText(/group name/i), 'Test Group');
    await userEvent.type(screen.getByLabelText(/group description/i), 'Test Description');
    await userEvent.type(screen.getByLabelText(/invite group members/i), 'test@example.com');
    fireEvent.click(screen.getByText('Add'));

    // Submit form
    fireEvent.click(screen.getByText('Create Group'));

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('here');
    });

    consoleLogSpy.mockRestore();
  });

  test('handles form reset after API error', async () => {
    const error = new Error('API Error');
    (api.post as jest.Mock).mockRejectedValueOnce(error);

    // Fill form with valid data
    await userEvent.type(screen.getByLabelText(/group name/i), 'Test Group');
    await userEvent.type(screen.getByLabelText(/group description/i), 'Test Description');
    await userEvent.type(screen.getByLabelText(/invite group members/i), 'test@example.com');
    fireEvent.click(screen.getByText('Add'));

    // Submit form
    fireEvent.click(screen.getByText('Create Group'));

    await waitFor(() => {
      expect(screen.getByText('Create Group')).toBeEnabled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('validates member email when adding with empty value', async () => {
    const addButton = screen.getByTestId('add-member-button');
    fireEvent.click(addButton);

    // Check that no member was added
    expect(screen.queryByText('•')).not.toBeInTheDocument();
    expect(screen.getByText('Create Group')).toBeDisabled();
  });

  test('handles touched states for all form fields', async () => {
    // Touch all fields without entering values
    const nameInput = screen.getByLabelText(/group name/i);
    const descInput = screen.getByLabelText(/group description/i);
    const emailInput = screen.getByLabelText(/invite group members/i);

    fireEvent.focus(nameInput);
    fireEvent.blur(nameInput);
    fireEvent.focus(descInput);
    fireEvent.blur(descInput);
    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/please enter a group name/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a group description/i)).toBeInTheDocument();
    });
  });
}); 