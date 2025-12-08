/**
 * SettingsModal - Configurações do aplicativo
 */

"use client";

import Modal from "./Modal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚙️ Configurações">
      <div className="space-y-6">
        {/* Tema */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Aparência
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
              <input
                type="radio"
                name="theme"
                defaultChecked
                className="w-4 h-4"
              />
              <span className="text-gray-700 dark:text-gray-200">
                🌞 Modo Claro
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
              <input type="radio" name="theme" className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-200">
                🌙 Modo Escuro
              </span>
            </label>
          </div>
        </div>

        {/* Notificações */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Notificações
          </h3>
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-200">
              Lembretes diários
            </span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </label>
        </div>

        {/* Sobre */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            TimeFlow Tracker v1.0.0
          </p>
        </div>
      </div>
    </Modal>
  );
}
