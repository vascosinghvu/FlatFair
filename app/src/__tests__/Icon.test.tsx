import { render } from '@testing-library/react';
import Icon from '../components/Icon';

describe('Icon Component', () => {
  test('renders with default fontSize when not provided', () => {
    const { container } = render(<Icon glyph="user" />);
    const icon = container.querySelector('.Icon');
    expect(icon).toHaveClass('Text-fontSize--');
  });

  test('renders with custom fontSize when provided', () => {
    const { container } = render(<Icon glyph="user"  />);
    const icon = container.querySelector('.Icon');
    expect(icon).toHaveClass('Text-fontSize--14');
  });

  test('handles undefined fontSize', () => {
    const { container } = render(<Icon glyph="user"  />);
    const icon = container.querySelector('.Icon');
    expect(icon).toHaveClass('Text-fontSize--');
  });
}); 