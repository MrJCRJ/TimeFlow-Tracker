/**
 * ProgressBar - Barra de progresso animada
 */

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  color?: "blue" | "green" | "purple" | "gradient";
  size?: "sm" | "md";
}

export default function ProgressBar({ 
  current, 
  total, 
  showLabel = true,
  color = "gradient",
  size = "md"
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2"
  };

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    gradient: "bg-gradient-to-r from-blue-500 to-purple-500"
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{current}/{total}</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
      )}
      <div className={`${heightClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
