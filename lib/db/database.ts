/**
 * Definição do banco de dados IndexedDB
 */

import Dexie, { Table } from "dexie";

// Tipos
export interface Activity {
  id?: number;
  title: string;
  summary?: string;
  category?: string;
  aiResponse?: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes?: number;
}

export interface Feedback {
  id?: number;
  date: string;
  type: "daily" | "weekly" | "monthly";
  theme?: string;
  score?: number;
  insights?: string[];
  suggestion?: string;
  createdAt: Date;
}

export interface PendingInput {
  id?: number;
  text: string;
  timestamp: Date;
  processed: boolean;
  processedAt?: Date;
  result?: string;
}

export interface ResponseCache {
  id?: number;
  activityPattern: string; // Padrão normalizado da atividade
  category: string;
  response: string; // Resposta da IA
  usageCount: number; // Quantas vezes foi reutilizada
  lastUsed: Date;
  createdAt: Date;
}

export interface Goal {
  id?: number;
  originalText: string; // Texto original do usuário
  improvedText: string; // Versão melhorada pela IA
  objectives: string[]; // Array de objetivos específicos (metas para alcançar o objetivo maior)
  status: "active" | "completed" | "archived";
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Database
class TimeFlowDB extends Dexie {
  activities!: Table<Activity>;
  feedbacks!: Table<Feedback>;
  pendingInputs!: Table<PendingInput>;
  responseCache!: Table<ResponseCache>;
  goals!: Table<Goal>;

  constructor() {
    super("TimeFlowDB");
    this.version(3).stores({
      activities: "++id, title, startedAt, endedAt, category",
      feedbacks: "++id, date, type, createdAt",
      pendingInputs: "++id, timestamp, processed",
      responseCache: "++id, category, lastUsed, createdAt",
      goals: "++id, status, createdAt, updatedAt",
    });
  }
}

// Instância única (singleton)
export const db = new TimeFlowDB();
