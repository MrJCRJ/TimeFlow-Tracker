/**
 * Badge - Componente de badge reutilizável
 */

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
}

export default function Badge({ 
  children, 
  variant = "default", 
  size = "md",
  rounded = true
}: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-orange-100 text-orange-700",
    danger: "bg-red-100 text-red-700"
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  };

  return (
    <span 
      className={`
        inline-flex items-center font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${rounded ? "rounded-full" : "rounded"}
      `}
    >
      {children}
    </span>
  );
}
