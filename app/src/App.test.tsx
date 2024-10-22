import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders FlatFare logo', () => {
  render(<App />);
  const logoElement = screen.getByText(/Flat/i);
  expect(logoElement).toBeInTheDocument();
  const logoElement2 = screen.getByText(/Fare/i);
  expect(logoElement2).toBeInTheDocument();
});

test('renders Home link', () => {
  render(<App />);
  const homeLink = screen.getByText(/Home/i);
  expect(homeLink).toBeInTheDocument();
});

test('renders Logout link', () => {
  render(<App />);
  const logoutLink = screen.getByText(/Logout/i);
  expect(logoutLink).toBeInTheDocument();
});
