/**
 * GoalCard - Card individual de objetivo com expansão
 */

import { useState } from "react";
import { Goal } from "@/lib/db/database";
import ProgressBar from "../ui/ProgressBar";
import Button from "../ui/Button";

interface GoalCardProps {
  goal: Goal;
  onComplete: (id: number) => void;
  onView: (goal: Goal) => void;
  onArchive: (id: number) => void;
}

export default function GoalCard({ goal, onComplete, onView, onArchive }: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedObjectives = goal.objectives.filter(o => o.includes('✓')).length;
  const totalObjectives = goal.objectives.length;

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header - Sempre Visível */}
      <div
        className="p-4 cursor-pointer active:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex-1 pr-2 leading-snug">
            {goal.improvedText}
          </h3>
          <span className="text-gray-400 text-xl">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
        
        {/* Barra de Progresso */}
        <div className="mb-2">
          <ProgressBar 
            current={completedObjectives} 
            total={totalObjectives}
            color="gradient"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="success"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(goal.id!);
            }}
            icon="✅"
          >
            Concluir
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              onView(goal);
            }}
            icon="👁️"
          >
            Detalhes
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onArchive(goal.id!);
            }}
          >
            📦
          </Button>
        </div>
      </div>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <div className="text-sm text-gray-700 mt-3">
            <strong className="text-gray-900">Metas específicas:</strong>
            <ul className="mt-2 space-y-2">
              {goal.objectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold min-w-[20px]">{idx + 1}.</span>
                  <span className="flex-1">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
            Criado em {new Date(goal.createdAt).toLocaleDateString("pt-BR")}
          </div>
        </div>
      )}
    </div>
  );
}
