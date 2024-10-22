// app/src/pages/Group.test.tsx
import React from 'react';
import { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Group from './Group';
import userEvent from '@testing-library/user-event';

describe('Group Component', () => {
  // Mock data to simulate the group information returned from the API
  const mockGroupData = {
    group: {
      members: [
        { name: 'John Doe', _id: '1' },
        { name: 'Jane Smith', _id: '2' },
      ],
      expenses: [
        {
          date: '2024-10-21T22:54:00',
          createdBy: { name: 'Charlotte Conze' },
          description: 'Chipotle',
          amount: 75.32,
          status: 'Pending',
        },
      ],
    },
  };

  // Set up a mock fetch function before each test
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        url: '',
        redirected: false,
        type: 'basic',
        clone: jest.fn(),
        json: () => Promise.resolve(mockGroupData),
        text: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        arrayBuffer: jest.fn(),
        body: null,
        bodyUsed: false,
      } as unknown as Response)
    );
  });

  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test to check if group members and expenses are rendered correctly
  test('renders group members and expenses', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/group/1']}>
          <Routes>
            <Route path="/group/:groupid" element={<Group />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Check if group members are displayed
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check if expense details are displayed
    expect(screen.getByText('Chipotle')).toBeInTheDocument();
    expect(screen.getByText('$75.32')).toBeInTheDocument();
  });

  // Test to check if the "Create New Expense" modal opens when the button is clicked
  test('opens modal when "Create New Expense" button is clicked', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/group/1']}>
          <Routes>
            <Route path="/group/:groupid" element={<Group />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Wait for the "Create New Expense" button to appear and click it
    await waitFor(() => expect(screen.getByText('Create New Expense')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create New Expense'));

    // Check if the modal with the title "Add an Expense" is displayed
    expect(screen.getByText('Add an Expense')).toBeInTheDocument();
  });

  // Additional tests can be added here for form submission, validation, etc.
});
