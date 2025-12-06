"use client";

import { useEffect, useState } from "react";

interface AIResponseProps {
  response: string | null;
  category: string | null;
}

export default function AIResponseBubble({
  response,
  category,
}: AIResponseProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (response) {
      setShow(true);
      // Auto-hide após 5 segundos
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [response]);

  if (!show || !response) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 animate-bounce-in">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-2xl p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🤖</div>
          <div className="flex-1">
            {category && (
              <div className="text-xs opacity-80 mb-1">{category}</div>
            )}
            <div className="text-sm font-medium">{response}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
