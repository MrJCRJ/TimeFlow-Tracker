/**
 * PatternsModal - Insights de padrões de comportamento
 */

"use client";

import Modal from "./Modal";

interface PatternsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatternsModal({ isOpen, onClose }: PatternsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📈 Padrões">
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300 text-center py-8">
          Em breve: descubra seus padrões de produtividade!
        </p>

        {/* Placeholder */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
          <span className="text-4xl mb-4 block">📈</span>
          <p className="text-gray-500 dark:text-gray-400">
            Funcionalidade em desenvolvimento
          </p>
        </div>
      </div>
    </Modal>
  );
}
