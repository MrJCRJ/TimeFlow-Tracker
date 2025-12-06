import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Tabela de atividades locais (DELETADAS após análise diária)
export const activitiesLocal = sqliteTable("activities_local", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(), // Texto original do usuário
  summary: text("summary"), // Nome resumido pela IA
  category: text("category"), // Categoria com emoji (ex: 🏠 Casa)
  aiResponse: text("ai_response"), // Resposta motivacional da IA
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  durationMinutes: integer("duration_minutes"),
});

// Tabela de feedbacks permanentes (APENAS insights ficam)
export const feedbacksLocal = sqliteTable("feedbacks_local", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD
  type: text("type").notNull().default("daily"), // daily | weekly | monthly
  theme: text("theme"), // Tema principal do dia
  score: integer("score"), // 0-10
  insights: text("insights", { mode: "json" }).$type<string[]>(), // Array de insights
  suggestion: text("suggestion"), // Sugestão para o próximo dia
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type Activity = typeof activitiesLocal.$inferSelect;
export type NewActivity = typeof activitiesLocal.$inferInsert;
export type Feedback = typeof feedbacksLocal.$inferSelect;
export type NewFeedback = typeof feedbacksLocal.$inferInsert;

// Tabela de inputs pendentes (quando IA está offline)
export const pendingInputs = sqliteTable("pending_inputs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(), // O que o usuário digitou
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(), // Quando digitou
  processed: integer("processed", { mode: "boolean" }).notNull().default(false), // Já processado?
  processedAt: integer("processed_at", { mode: "timestamp" }), // Quando foi processado
  result: text("result"), // JSON com resultado (intent, category, response, etc)
});

export type PendingInput = typeof pendingInputs.$inferSelect;
export type NewPendingInput = typeof pendingInputs.$inferInsert;
