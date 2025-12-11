/**
 * GoalCreator - Interface de criação de objetivos com IA
 */

import { useState } from "react";
import Button from "../ui/Button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GoalCreatorProps {
  conversation: Message[];
  onSubmit: (input: string) => Promise<void>;
  onReset: () => void;
  isProcessing: boolean;
}

export default function GoalCreator({ 
  conversation, 
  onSubmit, 
  onReset,
  isProcessing 
}: GoalCreatorProps) {
  const [goalInput, setGoalInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!goalInput.trim() || isProcessing) return;
    onSubmit(goalInput);
    setGoalInput("");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Indicador de Progresso */}
      <div className="mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            conversation.length === 0 ? "bg-blue-600 text-white" : "bg-green-500 text-white"
          }`}>
            {conversation.length === 0 ? "1" : "✓"}
          </div>
          <div className={`h-1 w-12 ${
            conversation.length > 0 ? "bg-blue-600" : "bg-gray-200"
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            conversation.length > 0 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
          }`}>
            2
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 px-4">
          <span>Descreva</span>
          <span>Refine com IA</span>
        </div>
      </div>

      {/* Instruções Contextuais */}
      {conversation.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                Como funciona?
              </h3>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Digite seu objetivo (pode ser vago)</li>
                <li>• A IA vai estruturar e criar metas</li>
                <li>• Refine conversando se necessário</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Chat History */}
      {conversation.length > 0 && (
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`rounded-2xl p-3 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white ml-8"
                  : "bg-gray-100 text-gray-900 mr-8"
              }`}
            >
              <div className="text-xs font-semibold mb-1 opacity-80">
                {msg.role === "user" ? "Você" : "IA Assistente"}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 pt-4 bg-white">
        <textarea
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            conversation.length === 0
              ? "Ex: Quero melhorar minha produtividade no trabalho..."
              : "Continue refinando seu objetivo..."
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
          rows={3}
          disabled={isProcessing}
        />
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleSubmit}
            disabled={!goalInput.trim()}
            loading={isProcessing}
            variant="primary"
            fullWidth
          >
            {conversation.length === 0 ? "✨ Estruturar" : "💬 Enviar"}
          </Button>
          {conversation.length > 0 && (
            <Button
              onClick={onReset}
              variant="secondary"
            >
              🔄
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Enter = enviar • Shift+Enter = nova linha
        </p>
      </div>
    </div>
  );
}
