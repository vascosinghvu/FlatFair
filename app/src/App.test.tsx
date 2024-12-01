import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders welcome message', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const welcomeElement = screen.getByText('Welcome to FlatFair');
  expect(welcomeElement).toBeInTheDocument();
});

test('renders get started button', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const getStartedButton = screen.getByText('Get Started');
  expect(getStartedButton).toBeInTheDocument();
});
