/**
 * BottomSheet - Modal otimizado para mobile (slide-up)
 */

import { ReactNode, useEffect } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children,
  actions
}: BottomSheetProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-4">
          {children}
        </div>

        {/* Footer Actions */}
        {actions && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
