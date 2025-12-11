/**
 * StatCard - Card de estatística com gradiente
 */

interface StatCardProps {
  label: string;
  value: string | number;
  color: "blue" | "green" | "purple" | "orange" | "red";
  size?: "sm" | "md";
}

export default function StatCard({ label, value, color, size = "md" }: StatCardProps) {
  const gradients = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800",
    green: "from-green-50 to-green-100 dark:from-green-900 dark:to-green-800",
    purple: "from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800",
    orange: "from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800",
    red: "from-red-50 to-red-100 dark:from-red-900 dark:to-red-800"
  };

  const textColors = {
    blue: "text-blue-600 dark:text-blue-300",
    green: "text-green-600 dark:text-green-300",
    purple: "text-purple-600 dark:text-purple-300",
    orange: "text-orange-600 dark:text-orange-300",
    red: "text-red-600 dark:text-red-300"
  };

  const valueSize = size === "sm" ? "text-2xl" : "text-3xl";

  return (
    <div className={`bg-gradient-to-br ${gradients[color]} rounded-xl p-4`}>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{label}</p>
      <p className={`${valueSize} font-bold ${textColors[color]}`}>{value}</p>
    </div>
  );
}
