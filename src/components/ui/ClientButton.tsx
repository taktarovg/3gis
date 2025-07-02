'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ClientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const ClientButton = forwardRef<HTMLButtonElement, ClientButtonProps>(
  ({ className, variant = 'default', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      default: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
      outline: 'border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 bg-white',
      ghost: 'text-gray-700 hover:text-blue-600 hover:bg-blue-50',
      link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline'
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          loading && 'opacity-75 cursor-wait',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Загрузка...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

ClientButton.displayName = 'ClientButton';
