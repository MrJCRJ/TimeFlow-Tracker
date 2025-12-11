/**
 * EmptyState - Componente reutilizável para estados vazios
 */

import { ReactNode } from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function EmptyState({ 
  icon, 
  title, 
  description,
  action,
  size = "md"
}: EmptyStateProps) {
  const sizeClasses = {
    sm: { icon: "text-3xl", padding: "py-6" },
    md: { icon: "text-5xl", padding: "py-12" },
    lg: { icon: "text-6xl", padding: "py-16" }
  };

  return (
    <div className={`text-center ${sizeClasses[size].padding}`}>
      <span className={`${sizeClasses[size].icon} mb-4 block`}>{icon}</span>
      <p className="text-gray-600 font-medium mb-2">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 mb-6 px-4">{description}</p>
      )}
      {action && <div className="max-w-xs mx-auto px-4">{action}</div>}
    </div>
  );
}
