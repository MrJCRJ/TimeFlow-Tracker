/**
 * Templates de Respostas Locais
 * Respostas pré-definidas que não requerem chamada à API
 */

/**
 * Templates locais variados por categoria (SEM CUSTO de API)
 * Múltiplas opções para evitar repetição
 */
export const LOCAL_TEMPLATES: Record<string, string[]> = {
  "💼 Trabalho": [
    "Foco total! 💪",
    "Produtividade em alta! 🚀",
    "Vai que é sua! 💼",
    "Trabalho bem executado!",
    "Mantém o ritmo! ⚡",
    "Arrasando no trampo! 🔥",
    "Profissionalismo nota 10! ⭐",
    "Foco e determinação! 🎯",
  ],
  "🍳 Alimentação": [
    "Bom apetite! 🍽️",
    "Recarregando energias! ⚡",
    "Hora de se alimentar bem! 🥗",
    "Nutrição é fundamental! 💪",
    "Que seja delicioso! 😋",
    "Saboreando com calma! ☕",
    "Comida boa, vida boa! 🍲",
  ],
  "🚿 Higiene": [
    "Cuidando de você! ✨",
    "Higiene em dia! 🧼",
    "Renovado! 🚿",
    "Auto-cuidado importa! 💙",
    "Limpinho! 😊",
    "Fresquinho agora! 🌊",
    "Cuidados essenciais! ⭐",
  ],
  "🧘 Saúde": [
    "Saúde em primeiro lugar! 💚",
    "Descansando bem! 😴",
    "Corpo agradece! 🙏",
    "Equilíbrio é chave! ⚖️",
    "Cuidando do essencial! 💪",
    "Bem-estar garantido! ✨",
    "Mente e corpo em dia! 🧘",
  ],
  "🎮 Lazer": [
    "Aproveite! 🎉",
    "Momento de relaxar! 😌",
    "Diversão merecida! 🎮",
    "Equilíbrio é tudo! ⚖️",
    "Hora de curtir! 🎊",
    "Relaxa e aproveita! 🌟",
    "Lazer também é importante! 🎭",
  ],
  "🏠 Casa": [
    "Casa organizada! 🏡",
    "Lar bem cuidado! 💙",
    "Ambiente em ordem! ✨",
    "Limpeza feita! 🧹",
    "Organização top! 📦",
    "Casa arrumada, mente tranquila! 🌸",
    "Capricho no lar! 🏠",
  ],
  "📚 Estudos": [
    "Conhecimento é poder! 📖",
    "Aprendendo sempre! 🧠",
    "Evolução constante! 📈",
    "Dedicação aos estudos! ⭐",
    "Investindo em você! 💡",
    "Aprendizado contínuo! 🎓",
    "Foco nos estudos! 📚",
  ],
  "🛒 Compras": [
    "Comprinha em dia! 🛒",
    "Lista completa! ✅",
    "Abastecimento feito! 🛍️",
    "Organização nas compras! 📝",
  ],
  "🚗 Transporte": [
    "Bora lá! 🚗",
    "A caminho! 🛣️",
    "Deslocamento em curso! 🚙",
    "Viagem iniciada! ✈️",
  ],
  "👥 Social": [
    "Conexões importam! 💬",
    "Momento social! 👥",
    "Relacionamentos alimentam! 💙",
    "Bom papo! ☕",
    "Tempo de qualidade! ⭐",
  ],
  "📝 Outros": [
    "Registrado! ✅",
    "Atividade anotada! 📝",
    "Mais uma feita! 👍",
    "Continuando o dia! 🌟",
    "Ação registrada! ✔️",
    "Marcado! 📌",
  ],
};

interface TemplateContext {
  previousCategory?: string;
  totalMinutesWorked?: number;
  sameActivityCount?: number;
}

/**
 * Seleciona template com contexto do histórico
 */
export function getLocalTemplate(
  category: string,
  context?: TemplateContext
): string {
  const templates = LOCAL_TEMPLATES[category] || LOCAL_TEMPLATES["📝 Outros"];

  if (!context) {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // CONTEXTO 1: Descanso após muito trabalho
  if (
    category === "🧘 Saúde" &&
    context.previousCategory === "💼 Trabalho" &&
    context.totalMinutesWorked &&
    context.totalMinutesWorked > 180
  ) {
    return "Descanso merecido após tanto trabalho! 😌";
  }

  // CONTEXTO 2: Lazer após trabalho
  if (
    category === "🎮 Lazer" &&
    context.previousCategory === "💼 Trabalho" &&
    context.totalMinutesWorked &&
    context.totalMinutesWorked > 120
  ) {
    return "Trabalhou bem, agora é hora de relaxar! 🎮";
  }

  // CONTEXTO 3: Repetição da mesma atividade
  if (context.sameActivityCount && context.sameActivityCount >= 3) {
    const repetitionTemplates = [
      "De novo? Tá dedicado(a) hoje! 💪",
      "Mais uma rodada! Persistência é tudo! 🔄",
      "Caprichando na repetição! ✨",
    ];
    return repetitionTemplates[
      Math.floor(Math.random() * repetitionTemplates.length)
    ];
  }

  // CONTEXTO 4: Muito tempo trabalhando (6h+)
  if (
    category === "💼 Trabalho" &&
    context.totalMinutesWorked &&
    context.totalMinutesWorked > 360
  ) {
    return "Jornada intensa! Já pensou em uma pausa? 💼⏸️";
  }

  // CONTEXTO 5: Primeira atividade de lazer do dia
  if (
    category === "🎮 Lazer" &&
    (!context.totalMinutesWorked || context.totalMinutesWorked < 60)
  ) {
    return "Começando o dia com leveza! 😊";
  }

  // Caso padrão: escolhe aleatório
  return templates[Math.floor(Math.random() * templates.length)];
}
