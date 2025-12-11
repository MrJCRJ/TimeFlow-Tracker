/**
 * TextArea - Componente de textarea reutilizável
 */

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    maxLength,
    showCount = false,
    value,
    className = "", 
    ...props 
  }, ref) => {
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          {showCount && maxLength && (
            <span className="text-xs text-gray-500">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          className={`
            w-full px-3 py-2 border rounded-lg resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
