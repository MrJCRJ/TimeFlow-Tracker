/**
 * GoalDiscovery - Interface de auto-descoberta de objetivos
 */

import { useState } from "react";
import Button from "../ui/Button";

interface GoalDiscoveryProps {
  onAnalyze: (description: string) => Promise<void>;
  isProcessing: boolean;
}

export default function GoalDiscovery({ onAnalyze, isProcessing }: GoalDiscoveryProps) {
  const [selfDescription, setSelfDescription] = useState("");

  const handleSubmit = () => {
    if (!selfDescription.trim() || isProcessing) return;
    onAnalyze(selfDescription);
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="text-center px-2">
        <div className="text-4xl mb-2">🔍</div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Descubra Seus Objetivos
        </h3>
        <p className="text-sm text-gray-600">
          Escreva livremente sobre você, seus sonhos e aspirações
        </p>
      </div>

      {/* Área de Texto Principal */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
        <label className="block text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
          <span>💭</span>
          <span>Conte sua história:</span>
        </label>
        <textarea
          value={selfDescription}
          onChange={(e) => setSelfDescription(e.target.value)}
          className="w-full p-3 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white"
          rows={8}
          placeholder="O que te faz feliz? Seus maiores sonhos? Que tipo de pessoa quer ser? Habilidades que quer desenvolver? Impacto que quer deixar?"
        />
        <div className="flex items-start gap-2 mt-2 text-xs text-purple-700 bg-purple-100 rounded-lg p-2">
          <span>💡</span>
          <span>Quanto mais detalhes, melhores as sugestões!</span>
        </div>
      </div>

      {/* Perguntas Inspiradoras */}
      <details className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
        <summary className="px-4 py-3 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 flex items-center gap-2">
          <span>💡</span>
          <span>Perguntas para te inspirar</span>
        </summary>
        <div className="px-4 pb-4 pt-2 space-y-2 text-sm text-gray-700">
          {[
            "Quais valores guiam sua vida?",
            "O que te deixa mais realizado?",
            "Quais atividades te fazem perder a noção do tempo?",
            "Se dinheiro não fosse problema, o que faria?",
            "Habilidades que gostaria de desenvolver?",
            "Que impacto quer deixar no mundo?",
            "Como imagina sua vida ideal?",
            "O que te motiva a acordar todos os dias?"
          ].map((question, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>{question}</span>
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-3 italic border-t border-gray-200 pt-3">
            Use apenas como inspiração - escreva do seu jeito! 🎨
          </p>
        </div>
      </details>

      {/* Botão de Análise */}
      <div className="sticky bottom-0 bg-white pt-2 pb-1 border-t border-gray-200 -mx-4 px-4">
        <Button
          onClick={handleSubmit}
          disabled={!selfDescription.trim()}
          loading={isProcessing}
          variant="primary"
          fullWidth
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          icon="✨"
        >
          Descobrir Meus Objetivos
        </Button>
        <p className="text-xs text-center text-gray-600 mt-2">
          A IA vai melhorar seu texto e criar objetivos personalizados
        </p>
      </div>
    </div>
  );
}
