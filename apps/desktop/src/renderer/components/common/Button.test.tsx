import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple Button component for testing
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary' 
}) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`.trim();

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  );
};

// Tests
describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('should render with primary variant by default', () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByTestId('button');
    expect(button.className).toContain('bg-blue-500');
  });

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByTestId('button');
    expect(button.className).toContain('bg-gray-500');
  });

  it('should render with danger variant', () => {
    render(<Button variant="danger">Danger Button</Button>);
    const button = screen.getByTestId('button');
    expect(button.className).toContain('bg-red-500');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    expect(button.className).toContain('opacity-50');
  });

  it('should call onClick when clicked', () => {
    let clicked = false;
    const handleClick = () => { clicked = true; };
    
    render(<Button onClick={handleClick}>Clickable</Button>);
    const button = screen.getByTestId('button');
    
    button.click();
    expect(clicked).toBe(true);
  });
});