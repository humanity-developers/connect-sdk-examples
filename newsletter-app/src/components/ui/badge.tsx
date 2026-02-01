import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground rounded-full',
        secondary:
          'border-[rgba(255,255,255,0.08)] bg-[#111111] text-[rgba(255,255,255,0.65)] rounded-full',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground rounded-full',
        outline: 
          'border-[rgba(255,255,255,0.12)] bg-transparent text-foreground rounded-full',
        success: 
          'border-[rgba(143,255,0,0.2)] bg-[rgba(143,255,0,0.1)] text-humanity-lime rounded-full',
        warning:
          'border-[rgba(255,184,0,0.2)] bg-[rgba(255,184,0,0.1)] text-[#ffb800] rounded-full',
        error:
          'border-[rgba(255,71,87,0.2)] bg-[rgba(255,71,87,0.1)] text-[#ff4757] rounded-full',
        social: 
          'border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.1)] text-[#3b82f6] rounded-full',
        preset: 
          'border-[rgba(168,85,247,0.2)] bg-[rgba(168,85,247,0.1)] text-[#a855f7] rounded-full',
        live:
          'border-[rgba(255,255,255,0.08)] bg-[#111111] text-humanity-lime rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
