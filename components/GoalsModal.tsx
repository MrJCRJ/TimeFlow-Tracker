/**
 * GoalsModal - Gerenciamento de metas com IA
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

export default function GoalsModal({ isOpen, onClose }: GoalsModalProps) {
  const [view, setView] = useState<"list" | "create" | "discover">("list");
  const [goalInput, setGoalInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});

  // Buscar metas ativas do banco
  const goals = useLiveQuery(() => getActiveGoals(), []);

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
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              view === "list"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            📋 Meus Objetivos ({goals?.length || 0})
          </button>
          <button
            onClick={() => setView("create")}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              view === "create"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ✨ Criar Objetivo
          </button>
          <button
            onClick={() => setView("discover")}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              view === "discover"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            🔍 Auto-Conhecimento
          </button>
        </div>

        {/* Vista de Lista */}
        {view === "list" && (
          <div className="space-y-3">
            {!goals || goals.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🎯</span>
                <p className="text-gray-500">
                  Nenhum objetivo criado ainda.
                  <br />
                  Clique em "Criar Objetivo" para começar!
                </p>
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {goal.improvedText}
                  </h3>
                  <div className="text-sm text-gray-600 mb-3">
                    <strong>Metas específicas:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {goal.objectives.slice(0, 3).map((objective, idx) => (
                        <li key={idx}>{objective}</li>
                      ))}
                      {goal.objectives.length > 3 && (
                        <li className="text-gray-400">
                          +{goal.objectives.length - 3} mais...
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewGoal(goal)}
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                    >
                      👁️ Ver Detalhes
                    </button>
                    <button
                      onClick={() => handleCompleteGoal(goal.id!)}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                    >
                      ✅ Concluir
                    </button>
                    <button
                      onClick={() => handleArchiveGoal(goal.id!)}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                    >
                      📦 Arquivar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Vista de Criação */}
        {view === "create" && (
          <div className="space-y-4">
            {/* Instruções */}
            {conversation.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  💡 Como funciona?
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Digite seu objetivo maior (pode ser vago)</li>
                  <li>• A IA vai melhorar a redação e torná-lo mais claro</li>
                  <li>• Ela criará metas específicas e acionáveis</li>
                  <li>• Pode fazer perguntas para entender melhor</li>
                </ul>
              </div>
            )}

            {/* Histórico da conversa */}
            {conversation.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-100 ml-8"
                        : "bg-gray-100 mr-8"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {msg.role === "user" ? "📝 Você:" : "🤖 Assistente IA:"}
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-gray-800">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Input de meta */}
            <div className="space-y-2">
              <textarea
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  conversation.length === 0
                    ? "Ex: Quero melhorar minha produtividade..."
                    : "Digite sua resposta ou novo objetivo..."
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                disabled={isProcessing}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!goalInput.trim() || isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isProcessing ? "🔄 Processando..." : "✨ Estruturar Objetivo"}
                </button>
                {conversation.length > 0 && (
                  <button
                    onClick={handleNewGoal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    🔄 Novo Objetivo
                  </button>
                )}
              </div>
            </div>

            {/* Dica sobre Enter */}
            <p className="text-xs text-gray-500 text-center">
              Pressione Enter para enviar • Shift+Enter para nova linha
            </p>
          </div>
        )}

        {/* Vista de Auto-Conhecimento */}
        {view === "discover" && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔍 Descubra Seus Verdadeiros Objetivos
              </h3>
              <p className="text-sm text-gray-600">
                Conte-nos sobre você! Escreva livremente o que te motiva, seus sonhos, valores ou qualquer coisa que queira alcançar.
              </p>
            </div>

            {/* Área de Texto Principal */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <label className="block text-sm font-medium text-purple-800 mb-3">
                💭 Compartilhe seus pensamentos, sonhos e aspirações:
              </label>
              <textarea
                value={reflectionAnswers.selfDescription || ""}
                onChange={(e) => setReflectionAnswers(prev => ({ ...prev, selfDescription: e.target.value }))}
                className="w-full p-4 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={8}
                placeholder="O que te faz feliz? Quais são seus maiores sonhos? Que tipo de pessoa você quer ser? Quais habilidades quer desenvolver? Que impacto quer deixar no mundo?..."
              />
              <p className="text-xs text-purple-600 mt-2">
                💡 Escreva o que quiser - quanto mais detalhes, melhores serão as sugestões!
              </p>
            </div>

            {/* Sugestões de Perguntas */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                💡 Algumas perguntas para te inspirar (opcional):
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="space-y-2">
                  <div>• Quais valores guiam sua vida?</div>
                  <div>• O que te deixa mais realizado?</div>
                  <div>• Quais atividades te fazem perder a noção do tempo?</div>
                  <div>• Se dinheiro não fosse problema, o que você faria?</div>
                </div>
                <div className="space-y-2">
                  <div>• Quais habilidades você gostaria de desenvolver?</div>
                  <div>• Que impacto você quer deixar no mundo?</div>
                  <div>• Como você imagina sua vida ideal?</div>
                  <div>• O que te motiva a acordar todos os dias?</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">
                Essas são apenas sugestões - escreva do seu jeito! 🎨
              </p>
            </div>

            {/* Análise e Sugestões */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                🎯 Análise Personalizada
              </h4>
              <button
                onClick={handleAnalyzeReflections}
                disabled={isProcessing || !reflectionAnswers.selfDescription?.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-3"
              >
                {isProcessing ? "🔄 Analisando e melhorando seu texto..." : "✨ Analisar e Sugerir Objetivos"}
              </button>
              <p className="text-xs text-blue-700">
                A IA vai melhorar seu texto e criar objetivos SMART personalizados baseados no que você escreveu
              </p>
            </div>
          </div>
        )}

        {/* Modal de Detalhes do Objetivo */}
        {selectedGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">📋 Detalhes do Objetivo</h2>
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Objetivo:</h3>
                  <p className="text-gray-900">{selectedGoal.improvedText}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Metas específicas:</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedGoal.objectives.map((objective, idx) => (
                      <li key={idx} className="text-gray-800">{objective}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Histórico da Conversa:</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedGoal.conversationHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-sm ${
                          msg.role === "user" ? "bg-blue-50" : "bg-gray-50"
                        }`}
                      >
                        <strong>{msg.role === "user" ? "Você:" : "IA:"}</strong>
                        <p className="whitespace-pre-wrap mt-1">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Criada em: {new Date(selectedGoal.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

