/**
 * Alert - Componente de alerta reutilizável
 */

import { ReactNode } from "react";

interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
  icon?: string;
  onClose?: () => void;
}

export default function Alert({ 
  type = "info", 
  title, 
  children, 
  icon,
  onClose 
}: AlertProps) {
  const styles = {
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-900",
      titleColor: "text-blue-800",
      defaultIcon: "ℹ️"
    },
    success: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-900",
      titleColor: "text-green-800",
      defaultIcon: "✅"
    },
    warning: {
      bg: "bg-orange-50 border-orange-200",
      text: "text-orange-900",
      titleColor: "text-orange-800",
      defaultIcon: "⚠️"
    },
    error: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-900",
      titleColor: "text-red-800",
      defaultIcon: "❌"
    }
  };

  const style = styles[type];
  const displayIcon = icon || style.defaultIcon;

  return (
    <div className={`${style.bg} border rounded-lg p-4 ${style.text}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{displayIcon}</span>
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-1 ${style.titleColor}`}>
              {title}
            </h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
