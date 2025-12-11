/**
 * Button - Componente reutilizável de botão com variantes
 */

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "font-medium rounded-xl transition-colors inline-flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-700",
    success: "bg-green-100 hover:bg-green-200 text-green-700",
    danger: "bg-red-100 hover:bg-red-200 text-red-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700"
  };

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin">⚙️</span>
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
