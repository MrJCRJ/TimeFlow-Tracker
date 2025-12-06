"use client";

import { useState } from "react";

/**
 * Componente para importar/exportar dados
 */
export default function DataManager() {
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    try {
      setIsProcessing(true);

      // Busca TODOS os dados do banco
      const response = await fetch("/api/export-all");
      const allData = await response.json();

      // Cria objeto com todos os dados
      const exportData = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        data: {
          activities: allData.activities || [],
          feedbacks: allData.feedbacks || [],
          pendingInputs: allData.pending || [],
        },
      };

      // Cria arquivo para download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timeflow-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert("✅ Dados exportados com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("❌ Erro ao exportar dados");
    } finally {
      setIsProcessing(false);
      setShowMenu(false);
    }
  };

  const handleImport = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        setIsProcessing(true);

        try {
          const text = await file.text();
          const importData = JSON.parse(text);

          if (!importData.version || !importData.data) {
            throw new Error("Formato de arquivo inválido. Use um arquivo exportado pelo TimeFlow.");
          }

          // Envia dados para API de importação (passa o objeto completo)
          const response = await fetch("/api/import", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(importData),
          });

          const result = await response.json();

          if (response.ok) {
            const msg = `✅ Importação concluída!\n\n` +
              `📊 Atividades: ${result.imported.activities}\n` +
              `💡 Insights: ${result.imported.feedbacks}`;
            alert(msg);
            window.location.reload();
          } else {
            throw new Error(result.error || "Erro ao importar dados");
          }
        } catch (error) {
          console.error("Erro ao importar:", error);
          const message = error instanceof Error ? error.message : "Erro desconhecido";
          alert(`❌ Erro ao importar dados\n\n${message}\n\nVerifique se o arquivo é um backup válido do TimeFlow.`);
        } finally {
          setIsProcessing(false);
          setShowMenu(false);
        }
      };

      input.click();
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleClearData = async () => {
    if (
      !confirm(
        "⚠️ Tem certeza que deseja APAGAR TODOS OS DADOS?\n\nEsta ação não pode ser desfeita!\n\nRecomendamos fazer um backup primeiro."
      )
    ) {
      return;
    }

    if (
      !confirm(
        "🚨 ÚLTIMA CONFIRMAÇÃO!\n\nVocê está prestes a apagar:\n- Todas as atividades\n- Todos os insights\n- Todos os dados pendentes\n\nDeseja continuar?"
      )
    ) {
      return;
    }

    try {
      setIsProcessing(true);

      const response = await fetch("/api/clear-data", {
        method: "DELETE",
      });

      if (response.ok) {
        alert("✅ Todos os dados foram apagados!");
        window.location.reload();
      } else {
        throw new Error("Erro ao limpar dados");
      }
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      alert("❌ Erro ao limpar dados");
    } finally {
      setIsProcessing(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Menu */}
      {showMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu de opções */}
          <div className="absolute bottom-16 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 p-2 min-w-[200px]">
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3 disabled:opacity-50"
            >
              <span className="text-2xl">💾</span>
              <div>
                <div className="font-medium text-gray-900">Exportar</div>
                <div className="text-xs text-gray-500">Backup dos dados</div>
              </div>
            </button>

            <button
              onClick={handleImport}
              disabled={isProcessing}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3 disabled:opacity-50"
            >
              <span className="text-2xl">📥</span>
              <div>
                <div className="font-medium text-gray-900">Importar</div>
                <div className="text-xs text-gray-500">Restaurar backup</div>
              </div>
            </button>

            <div className="border-t border-gray-200 my-2" />

            <button
              onClick={handleClearData}
              disabled={isProcessing}
              className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3 disabled:opacity-50"
            >
              <span className="text-2xl">🗑️</span>
              <div>
                <div className="font-medium text-red-600">Apagar Tudo</div>
                <div className="text-xs text-red-400">Limpar dados</div>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Botão principal */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isProcessing}
        className="bg-gray-800 hover:bg-gray-900 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        title="Gerenciar Dados"
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M4 7l1-3h14l1 3M10 11v6m4-6v6"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
