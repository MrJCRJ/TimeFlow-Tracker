"use client";

import { useEffect, useState } from "react";

export default function SetupWarning() {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verifica se a API key está configurada
    const checkSetup = async () => {
      try {
        const response = await fetch("/api/check-setup");
        const data = await response.json();
        setNeedsSetup(!data.hasApiKey);
      } catch (error) {
        console.error("Erro ao verificar setup:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkSetup();
  }, []);

  if (isChecking || !needsSetup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao TimeFlow Tracker!
          </h2>
          <p className="text-gray-600">
            Sistema de tracking com IA que aprende com você
          </p>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-red-900 mb-3">
            ⚠️ Configuração Obrigatória
          </h3>
          <p className="text-red-800 mb-4">
            A <strong>IA DeepSeek</strong> é o coração deste sistema. Sem ela, o
            app não consegue fazer análises inteligentes.
          </p>
          <p className="text-red-700 text-sm">
            A IA aprende com você ao longo do tempo, reconhecendo padrões e
            dando insights cada vez mais personalizados.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            📝 Como Configurar (3 passos):
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>
                Acesse{" "}
                <a
                  href="https://platform.deepseek.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  platform.deepseek.com
                </a>{" "}
                e crie uma conta (grátis)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>Gere sua API Key na dashboard</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <div>
                <span>
                  Crie um arquivo{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">.env</code> na
                  raiz do projeto com:
                </span>
                <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
                  DEEPSEEK_API_KEY=sk-sua-key-aqui
                </pre>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-green-900 mb-2">
            ✨ Por que a IA é obrigatória?
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>🧠 Aprende seus padrões de produtividade</li>
            <li>📈 Reconhece sua evolução ao longo do tempo</li>
            <li>🎯 Dá sugestões personalizadas para VOCÊ</li>
            <li>💡 Fica mais inteligente a cada dia que passa</li>
          </ul>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>Depois de configurar, reinicie o servidor:</p>
          <code className="bg-gray-100 px-3 py-1 rounded mt-2 inline-block">
            npm run dev
          </code>
        </div>
      </div>
    </div>
  );
}
