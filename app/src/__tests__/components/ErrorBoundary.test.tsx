import { render } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

describe('ErrorBoundary Component', () => {
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  test('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  test('renders error message when there is an error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(getByText(/Something went wrong/i)).toBeInTheDocument();
  });
}); 