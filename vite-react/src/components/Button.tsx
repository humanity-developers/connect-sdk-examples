import { ReactNode } from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
}

export function Button({ onClick, children, variant = 'primary', className = '' }: ButtonProps) {
  const baseStyles = 'px-4 py-2 text-sm font-medium rounded-md transition-colors';

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-border hover:bg-muted',
    ghost: 'hover:bg-muted hover:text-foreground',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
