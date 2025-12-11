/**
 * GoalsList - Lista de objetivos com empty state
 */

import { Goal } from "@/lib/db/database";
import GoalCard from "./GoalCard";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";

interface GoalsListProps {
  goals: Goal[] | undefined;
  onComplete: (id: number) => void;
  onView: (goal: Goal) => void;
  onArchive: (id: number) => void;
  onCreateNew: () => void;
  onDiscover: () => void;
}

export default function GoalsList({ 
  goals, 
  onComplete, 
  onView, 
  onArchive,
  onCreateNew,
  onDiscover
}: GoalsListProps) {
  if (!goals || goals.length === 0) {
    return (
      <EmptyState
        icon="🎯"
        title="Nenhum objetivo ainda"
        description="Comece criando seu primeiro objetivo ou descubra novos através do auto-conhecimento"
        action={
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              fullWidth
              onClick={onCreateNew}
              icon="✨"
            >
              Criar Primeiro Objetivo
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={onDiscover}
              icon="🔍"
              className="bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              Descobrir Objetivos
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-3 flex-1 overflow-y-auto">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onComplete={onComplete}
          onView={onView}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}
