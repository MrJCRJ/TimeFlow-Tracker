/**
 * LoadingSpinner - Componente reutilizável de loading
 */

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  color?: "blue" | "white" | "gray";
}

export default function LoadingSpinner({ 
  size = "md", 
  message,
  color = "blue"
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  const colorClasses = {
    blue: "border-blue-500 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-400 border-t-transparent"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      />
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}
