'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { playClick } from '@/lib/sounds';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-zinc-200 text-zinc-950',
    'border border-zinc-400/50',
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),inset_0_-1px_0_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.3)]',
    'hover:bg-zinc-100',
    'active:bg-zinc-300 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.15)]',
  ].join(' '),
  secondary: [
    'bg-zinc-900 text-zinc-300',
    'border border-zinc-700/50',
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_1px_2px_0_rgba(0,0,0,0.5)]',
    'hover:bg-zinc-800 hover:text-zinc-200',
    'active:bg-zinc-950 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.4)]',
  ].join(' '),
  ghost: [
    'text-zinc-400',
    'hover:text-white hover:bg-white/[0.04]',
    'active:bg-white/[0.06]',
  ].join(' '),
  danger: [
    'bg-red-950/50 text-red-400',
    'border border-red-500/25',
    'shadow-[inset_0_1px_0_0_rgba(255,100,100,0.08),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_1px_2px_0_rgba(0,0,0,0.4)]',
    'hover:bg-red-950/70',
    'active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)]',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className = '', onClick, children, disabled, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        playClick();
        onClick?.(e);
      }
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center font-medium font-mono
          transition-all duration-100 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${loading ? 'cursor-wait' : ''}
          ${className}
        `.trim()}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-3.5 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
