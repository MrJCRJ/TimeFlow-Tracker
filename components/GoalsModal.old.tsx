/**
 * GoalsModal - Gerenciamento de metas com IA (Mobile-First)
 */

"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Modal from "./Modal";
import { getActiveGoals, createGoal, completeGoal, archiveGoal } from "@/lib/db/goals-queries";
import type { Goal } from "@/lib/db/database";

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ExpandedGoal {
  [key: number]: boolean;
}

export default function GoalsModal({ isOpen, onClose }: GoalsModalProps) {
  const [view, setView] = useState<"list" | "create" | "discover">("list");
  const [goalInput, setGoalInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [expandedGoals, setExpandedGoals] = useState<ExpandedGoal>({});
  const [createStep, setCreateStep] = useState<"input" | "chat">("input");

  // Buscar metas ativas do banco
  const goals = useLiveQuery(() => getActiveGoals(), []);

  const toggleGoalExpansion = (goalId: number) => {
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };

  const handleSubmit = async () => {
    if (!goalInput.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      const response = await fetch("/api/goals/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalText: goalInput,
          conversationHistory: conversation,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversationHistory);
        setGoalInput("");

        // Verificar se a IA forneceu uma meta melhorada (detectar se tem subtarefas)
        const lastMessage = data.conversationHistory[data.conversationHistory.length - 1];
        if (lastMessage.content.includes("SUBTAREFAS ACIONÁVEIS") || lastMessage.content.includes("META MELHORADA")) {
          // Perguntar se o usuário quer salvar a meta
          const shouldSave = confirm("✅ Meta estruturada com sucesso! Deseja salvá-la?");
          if (shouldSave) {
            await saveGoal(data.conversationHistory);
          }
        }
      } else {
        alert("❌ Erro ao processar meta. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao processar meta:", error);
      alert("❌ Erro ao processar meta. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveGoal = async (conversationHistory: Message[]) => {
    try {
      // Extrair informações da conversa
      const userMessages = conversationHistory.filter(m => m.role === "user");
      const lastAIMessage = conversationHistory[conversationHistory.length - 1];

      const originalText = userMessages[0]?.content || "";
      
      // Extrair meta melhorada e subtarefas do texto da IA
      const content = lastAIMessage.content;
      const improvedMatch = content.match(/META MELHORADA:\s*([^\n]+)/);
      const subtasksMatch = content.match(/SUBTAREFAS ACIONÁVEIS:\s*([\s\S]*?)(?=💡|$)/);
      
      const improvedText = improvedMatch ? improvedMatch[1].trim() : originalText;
      const subtasksText = subtasksMatch ? subtasksMatch[1] : "";
      const objectives = subtasksText
        .split("\n")
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, "").trim());

      await createGoal(originalText, improvedText, objectives, conversationHistory);
      
      // Resetar e voltar para lista
      setConversation([]);
      setGoalInput("");
      setView("list");
      alert("✅ Meta salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      alert("❌ Erro ao salvar meta");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNewGoal = () => {
    setConversation([]);
    setGoalInput("");
    setCreateStep("input");
  };

  const handleCompleteGoal = async (id: number) => {
    if (confirm("✅ Marcar esta meta como concluída?")) {
      await completeGoal(id);
    }
  };

  const handleArchiveGoal = async (id: number) => {
    if (confirm("📦 Arquivar esta meta?")) {
      await archiveGoal(id);
    }
  };

  const handleViewGoal = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const handleAnalyzeReflections = async () => {
    if (!reflectionAnswers.selfDescription?.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      const response = await fetch("/api/goals/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selfDescription: reflectionAnswers.selfDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Mostrar o texto melhorado e sugestões
        const improvedText = data.improvedText;
        const suggestions = data.suggestions;
        const message = `✨ Texto Melhorado:\n"${improvedText}"\n\n🎯 Sugestões de Objetivos:\n${suggestions}\n\nDeseja criar um objetivo baseado nessas sugestões?`;
        
        if (confirm(message)) {
          setView("create");
          setGoalInput(improvedText);
        }
      } else {
        alert("❌ Erro ao analisar seu texto. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao analisar reflexões:", error);
      alert("❌ Erro ao analisar seu texto. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎯 Objetivos & Metas">
      <div className="flex flex-col h-full">
        {/* Navegação por Swipe Style - Mobile First */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-4 overflow-x-auto">
          <button
            onClick={() => setView("list")}
            className={`flex-1 min-w-[100px] px-3 py-2.5 font-medium rounded-lg transition-all ${
              view === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">📋</span>
              <span className="text-xs whitespace-nowrap">Meus ({goals?.length || 0})</span>
            </div>
          </button>
          <button
            onClick={() => setView("create")}
            className={`flex-1 min-w-[100px] px-3 py-2.5 font-medium rounded-lg transition-all ${
              view === "create"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">✨</span>
              <span className="text-xs whitespace-nowrap">Criar</span>
            </div>
          </button>
          <button
            onClick={() => setView("discover")}
            className={`flex-1 min-w-[100px] px-3 py-2.5 font-medium rounded-lg transition-all ${
              view === "discover"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🔍</span>
              <span className="text-xs whitespace-nowrap">Descobrir</span>
            </div>
          </button>
        </div>

        {/* Vista de Lista - Cards Compactos e Expansíveis */}
        {view === "list" && (
          <div className="space-y-3 flex-1 overflow-y-auto">
            {!goals || goals.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">🎯</span>
                <p className="text-gray-600 font-medium mb-2">
                  Nenhum objetivo ainda
                </p>
                <p className="text-sm text-gray-500 mb-6 px-4">
                  Comece criando seu primeiro objetivo ou descubra novos através do auto-conhecimento
                </p>
                <div className="flex flex-col gap-2 max-w-xs mx-auto px-4">
                  <button
                    onClick={() => setView("create")}
                    className="bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ✨ Criar Primeiro Objetivo
                  </button>
                  <button
                    onClick={() => setView("discover")}
                    className="bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    🔍 Descobrir Objetivos
                  </button>
                </div>
              </div>
            ) : (
              goals.map((goal) => {
                const isExpanded = expandedGoals[goal.id!];
                const completedObjectives = goal.objectives.filter(o => o.includes('✓')).length;
                const totalObjectives = goal.objectives.length;
                const progress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

                return (
                  <div
                    key={goal.id}
                    className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
                  >
                    {/* Header - Sempre Visível */}
                    <div
                      className="p-4 cursor-pointer active:bg-gray-50"
                      onClick={() => toggleGoalExpansion(goal.id!)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 flex-1 pr-2 leading-snug">
                          {goal.improvedText}
                        </h3>
                        <span className="text-gray-400 text-xl">
                          {isExpanded ? "▼" : "▶"}
                        </span>
                      </div>
                      
                      {/* Barra de Progresso */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{completedObjectives}/{totalObjectives} metas</span>
                          <span className="font-semibold">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Actions - Compactas */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteGoal(goal.id!);
                          }}
                          className="flex-1 text-xs bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 font-medium transition-colors"
                        >
                          ✅ Concluir
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewGoal(goal);
                          }}
                          className="flex-1 text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 font-medium transition-colors"
                        >
                          👁️ Detalhes
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveGoal(goal.id!);
                          }}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                        >
                          📦
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo Expansível */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                        <div className="text-sm text-gray-700 mt-3">
                          <strong className="text-gray-900">Metas específicas:</strong>
                          <ul className="mt-2 space-y-2">
                            {goal.objectives.map((objective, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold min-w-[20px]">{idx + 1}.</span>
                                <span className="flex-1">{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                          Criado em {new Date(goal.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Vista de Criação - Simplificada */}
        {view === "create" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Indicador de Progresso */}
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  createStep === "input" ? "bg-blue-600 text-white" : "bg-green-500 text-white"
                }`}>
                  {createStep === "input" ? "1" : "✓"}
                </div>
                <div className={`h-1 w-12 ${
                  createStep === "chat" ? "bg-blue-600" : "bg-gray-200"
                }`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  createStep === "chat" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 px-4">
                <span>Descreva</span>
                <span>Refine com IA</span>
              </div>
            </div>

            {/* Instruções Contextuais - Compactas */}
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

            {/* Chat History - Scrollable */}
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

            {/* Input Area - Fixo no Bottom */}
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
                <button
                  onClick={handleSubmit}
                  disabled={!goalInput.trim() || isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-colors text-sm"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⚙️</span> Processando...
                    </span>
                  ) : conversation.length === 0 ? (
                    "✨ Estruturar"
                  ) : (
                    "💬 Enviar"
                  )}
                </button>
                {conversation.length > 0 && (
                  <button
                    onClick={handleNewGoal}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors text-sm"
                  >
                    🔄
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Enter = enviar • Shift+Enter = nova linha
              </p>
            </div>
          </div>
        )}

        {/* Vista de Auto-Conhecimento - Otimizada Mobile */}
        {view === "discover" && (
          <div className="flex flex-col flex-1 overflow-y-auto space-y-4">
            {/* Header Compacto */}
            <div className="text-center px-2">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Descubra Seus Objetivos
              </h3>
              <p className="text-sm text-gray-600">
                Escreva livremente sobre você, seus sonhos e aspirações
              </p>
            </div>

            {/* Área de Texto Principal - Destacada */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
              <label className="block text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <span>💭</span>
                <span>Conte sua história:</span>
              </label>
              <textarea
                value={reflectionAnswers.selfDescription || ""}
                onChange={(e) => setReflectionAnswers(prev => ({ ...prev, selfDescription: e.target.value }))}
                className="w-full p-3 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white"
                rows={8}
                placeholder="O que te faz feliz? Seus maiores sonhos? Que tipo de pessoa quer ser? Habilidades que quer desenvolver? Impacto que quer deixar?"
              />
              <div className="flex items-start gap-2 mt-2 text-xs text-purple-700 bg-purple-100 rounded-lg p-2">
                <span>💡</span>
                <span>Quanto mais detalhes, melhores as sugestões!</span>
              </div>
            </div>

            {/* Perguntas Inspiradoras - Collapsible */}
            <details className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <summary className="px-4 py-3 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 flex items-center gap-2">
                <span>💡</span>
                <span>Perguntas para te inspirar</span>
              </summary>
              <div className="px-4 pb-4 pt-2 space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Quais valores guiam sua vida?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>O que te deixa mais realizado?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Quais atividades te fazem perder a noção do tempo?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Se dinheiro não fosse problema, o que faria?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Habilidades que gostaria de desenvolver?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Que impacto quer deixar no mundo?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Como imagina sua vida ideal?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>O que te motiva a acordar todos os dias?</span>
                </div>
                <p className="text-xs text-gray-500 mt-3 italic border-t border-gray-200 pt-3">
                  Use apenas como inspiração - escreva do seu jeito! 🎨
                </p>
              </div>
            </details>

            {/* Botão de Análise - Destacado */}
            <div className="sticky bottom-0 bg-white pt-2 pb-1 border-t border-gray-200 -mx-4 px-4">
              <button
                onClick={handleAnalyzeReflections}
                disabled={isProcessing || !reflectionAnswers.selfDescription?.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg disabled:shadow-none"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    <span>Analisando...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    <span>Descobrir Meus Objetivos</span>
                  </span>
                )}
              </button>
              <p className="text-xs text-center text-gray-600 mt-2">
                A IA vai melhorar seu texto e criar objetivos personalizados
              </p>
            </div>
          </div>
        )}

        {/* Modal de Detalhes do Objetivo - Mobile Optimized */}
        {selectedGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>📋</span>
                  <span>Detalhes</span>
                </h2>
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto flex-1 p-4 space-y-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">🎯 Objetivo:</h3>
                  <p className="text-gray-900 leading-relaxed">{selectedGoal.improvedText}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm">✅ Metas específicas:</h3>
                  <ol className="space-y-3">
                    {selectedGoal.objectives.map((objective, idx) => (
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
                    {selectedGoal.conversationHistory.map((msg, idx) => (
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
                  Criado em {new Date(selectedGoal.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}