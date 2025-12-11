/**
 * GoalDetails - Modal de detalhes do objetivo
 */

import { Goal } from "@/lib/db/database";
import BottomSheet from "../ui/BottomSheet";
import Button from "../ui/Button";

interface GoalDetailsProps {
  goal: Goal | null;
  onClose: () => void;
}

export default function GoalDetails({ goal, onClose }: GoalDetailsProps) {
  if (!goal) return null;

  return (
    <BottomSheet
      isOpen={!!goal}
      onClose={onClose}
      title="📋 Detalhes"
      actions={
        <Button
          onClick={onClose}
          variant="secondary"
          fullWidth
        >
          Fechar
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-2 text-sm">🎯 Objetivo:</h3>
          <p className="text-gray-900 leading-relaxed">{goal.improvedText}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">✅ Metas específicas:</h3>
          <ol className="space-y-3">
            {goal.objectives.map((objective, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="text-gray-800 flex-1 pt-0.5">{objective}</span>
              </li>
            ))}
          </ol>
        </div>

        <details className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <summary className="px-4 py-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 text-sm">
            💬 Histórico da Conversa
          </summary>
          <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
            {goal.conversationHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-sm ${
                  msg.role === "user" ? "bg-blue-100" : "bg-white border border-gray-200"
                }`}
              >
                <strong className="text-xs">
                  {msg.role === "user" ? "Você:" : "IA:"}
                </strong>
                <p className="whitespace-pre-wrap mt-1 text-xs leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>
        </details>

        <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-200">
          Criado em {new Date(goal.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
