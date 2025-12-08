/**
 * GoalsModal - Gerenciamento de metas
 */

"use client";

import Modal from "./Modal";

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalsModal({ isOpen, onClose }: GoalsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎯 Metas">
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300 text-center py-8">
          Em breve: defina e acompanhe suas metas de produtividade!
        </p>

        {/* Placeholder */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
          <span className="text-4xl mb-4 block">🎯</span>
          <p className="text-gray-500 dark:text-gray-400">
            Funcionalidade em desenvolvimento
          </p>
        </div>
      </div>
    </Modal>
  );
}
