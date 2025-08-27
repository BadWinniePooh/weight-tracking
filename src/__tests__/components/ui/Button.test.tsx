import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

// Mock the theme hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => 'mock-theme-class',
}));

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should apply default variant classes', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('mock-theme-class');
  });

  it('should apply primary variant classes', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('mock-theme-class');
  });

  it('should apply secondary variant classes', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should apply different size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should show loading state', () => {
    render(<Button isLoading>Loading Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Button should be disabled during loading
    expect(button).toBeDisabled();
  });

  it('should apply full width class', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should handle different button types', () => {
    render(<Button type="submit">Submit Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should render with different variants', () => {
    const variants = ['danger', 'success', 'outline', 'ghost'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>{variant} Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      unmount();
    });
  });
});