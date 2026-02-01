import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground rounded-[10px] shadow-glow-sm hover:bg-humanity-lime-hover hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0',
        destructive:
          'bg-destructive text-destructive-foreground rounded-[10px] hover:bg-destructive/90',
        outline:
          'border border-[rgba(255,255,255,0.08)] bg-transparent text-foreground rounded-[10px] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.12)]',
        secondary:
          'bg-secondary text-secondary-foreground rounded-[10px] border border-[rgba(255,255,255,0.08)] hover:bg-[#161616] hover:border-[rgba(255,255,255,0.12)]',
        ghost: 
          'rounded-[10px] hover:bg-[rgba(255,255,255,0.04)] hover:text-foreground',
        link: 
          'text-primary underline-offset-4 hover:underline',
        wallet:
          'bg-[rgba(143,255,0,0.08)] text-humanity-lime border border-[rgba(143,255,0,0.2)] rounded-full hover:bg-[rgba(143,255,0,0.12)] hover:border-[rgba(143,255,0,0.3)]',
      },
      size: {
        default: 'h-11 px-6 py-2.5',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
