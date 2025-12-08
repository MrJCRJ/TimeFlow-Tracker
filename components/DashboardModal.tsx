/**
 * DashboardModal - Exibe estatísticas detalhadas
 */

"use client";

import Modal from "./Modal";

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
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Total de Atividades
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
              {stats.totalActivities}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Horas Totais
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-300">
              {stats.totalHours}h
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Categoria Mais Produtiva
            </p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-300">
              {stats.mostProductiveCategory}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Sequência (dias)
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-300">
              {stats.streak} 🔥
            </p>
          </div>
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
