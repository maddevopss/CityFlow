import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const generatedId = id || Math.random().toString(36).substring(2, 9);
    
    return (
      <div className={`w-full ${className}`}>
        <label htmlFor={generatedId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          id={generatedId}
          ref={ref}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cityflow-500 focus:border-transparent transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
