/**
 * DashboardModal - Exibe estatísticas detalhadas
 */

"use client";

import Modal from "./Modal";
import { StatCard } from "./ui";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalActivities: number;
    totalHours: number;
    mostProductiveCategory: string;
    streak: number;
  };
}

export default function DashboardModal({
  isOpen,
  onClose,
  stats,
}: DashboardModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Dashboard">
      <div className="space-y-6">
        {/* Estatísticas Gerais com StatCard */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total de Atividades"
            value={stats.totalActivities}
            color="blue"
          />
          
          <StatCard
            label="Horas Totais"
            value={`${stats.totalHours}h`}
            color="green"
          />
          
          <StatCard
            label="Categoria Mais Produtiva"
            value={stats.mostProductiveCategory}
            color="purple"
            size="sm"
          />
          
          <StatCard
            label="Sequência (dias)"
            value={`${stats.streak} 🔥`}
            color="orange"
          />
        </div>

        {/* Mensagem Motivacional */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white text-center">
          <p className="text-lg font-semibold">
            Continue assim! Você está evoluindo! 🚀
          </p>
        </div>
      </div>
    </Modal>
  );
}
