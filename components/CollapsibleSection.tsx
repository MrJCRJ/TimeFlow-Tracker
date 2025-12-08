/**
 * CollapsibleSection - Seção expansível/colapsável
 * Componente reutilizável para organizar conteúdo
 */

"use client";

import { useState, ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  itemCount?: number;
}

export default function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
  itemCount,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {title}
          </h3>
          {itemCount !== undefined && (
            <span className="px-2 py-1 text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
              {itemCount}
            </span>
          )}
        </div>

        {/* Ícone de seta */}
        <span
          className={`text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        >
          ▼
        </span>
      </button>

      {/* Conteúdo */}
      {isExpanded && (
        <div className="px-6 pb-6 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2">
          {children}
        </div>
      )}
    </div>
  );
}
