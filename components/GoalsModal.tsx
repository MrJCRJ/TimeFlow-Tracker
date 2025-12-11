/**
 * GoalsModal - Gerenciamento de metas com IA (Refatorado e Modular)
 */

"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Modal from "./Modal";
import TabBar from "./ui/TabBar";
import GoalsList from "./goals/GoalsList";
import GoalCreator from "./goals/GoalCreator";
import GoalDiscovery from "./goals/GoalDiscovery";
import GoalDetails from "./goals/GoalDetails";
import { getActiveGoals, createGoal, completeGoal, archiveGoal } from "@/lib/db/goals-queries";
import type { Goal } from "@/lib/db/database";
import { useApi } from "@/lib/hooks/useApi";

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ViewType = "list" | "create" | "discover";

export default function GoalsModal({ isOpen, onClose }: GoalsModalProps) {
  const [view, setView] = useState<ViewType>("list");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  const goals = useLiveQuery(() => getActiveGoals(), []);
  const { loading: isProcessing, execute: executeApi } = useApi();

  const tabs = [
    { id: "list", icon: "📋", label: "Meus", count: goals?.length || 0 },
    { id: "create", icon: "✨", label: "Criar" },
    { id: "discover", icon: "🔍", label: "Descobrir" }
  ];

  const handleCreateGoal = async (input: string) => {
    const response = await executeApi("/api/goals/improve", "POST", {
      goalText: input,
      conversationHistory: conversation,
    });

    setConversation(response.conversationHistory);

    // Verificar se a IA forneceu uma meta melhorada
    const lastMessage = response.conversationHistory[response.conversationHistory.length - 1];
    if (lastMessage.content.includes("SUBTAREFAS ACIONÁVEIS") || lastMessage.content.includes("META MELHORADA")) {
      const shouldSave = confirm("✅ Meta estruturada com sucesso! Deseja salvá-la?");
      if (shouldSave) {
        await saveGoal(response.conversationHistory);
      }
    }
  };

  const saveGoal = async (conversationHistory: Message[]) => {
    try {
      const userMessages = conversationHistory.filter(m => m.role === "user");
      const lastAIMessage = conversationHistory[conversationHistory.length - 1];

      const originalText = userMessages[0]?.content || "";
      
      // Extrair meta melhorada e subtarefas
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
      
      // Reset e voltar para lista
      setConversation([]);
      setView("list");
      alert("✅ Meta salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      alert("❌ Erro ao salvar meta");
    }
  };

  const handleResetCreator = () => {
    setConversation([]);
  };

  const handleDiscoverGoals = async (description: string) => {
    const response = await executeApi("/api/goals/discover", "POST", {
      selfDescription: description,
    });

    const improvedText = response.improvedText;
    const suggestions = response.suggestions;
    const message = `✨ Texto Melhorado:\n"${improvedText}"\n\n🎯 Sugestões de Objetivos:\n${suggestions}\n\nDeseja criar um objetivo baseado nessas sugestões?`;
    
    if (confirm(message)) {
      setView("create");
      // Poderia pré-preencher o input se necessário
    }
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="🎯 Objetivos & Metas">
        <div className="flex flex-col h-full">
          {/* Navegação por Tabs */}
          <div className="mb-4">
            <TabBar 
              tabs={tabs} 
              activeTab={view} 
              onChange={(id) => setView(id as ViewType)} 
            />
          </div>

          {/* Conteúdo por Vista */}
          {view === "list" && (
            <GoalsList
              goals={goals}
              onComplete={handleCompleteGoal}
              onView={setSelectedGoal}
              onArchive={handleArchiveGoal}
              onCreateNew={() => setView("create")}
              onDiscover={() => setView("discover")}
            />
          )}

          {view === "create" && (
            <GoalCreator
              conversation={conversation}
              onSubmit={handleCreateGoal}
              onReset={handleResetCreator}
              isProcessing={isProcessing}
            />
          )}

          {view === "discover" && (
            <GoalDiscovery
              onAnalyze={handleDiscoverGoals}
              isProcessing={isProcessing}
            />
          )}
        </div>
      </Modal>

      {/* Modal de Detalhes */}
      <GoalDetails 
        goal={selectedGoal} 
        onClose={() => setSelectedGoal(null)} 
      />
    </>
  );
}
