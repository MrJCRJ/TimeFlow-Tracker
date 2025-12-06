"use client";

import { useState, useEffect } from "react";
import { db, Activity, Feedback } from "@/lib/db/indexeddb";
import { useLiveQuery } from "dexie-react-hooks";

export function useActivities() {
  const activities = useLiveQuery(() => db.activities.toArray());
  return activities || [];
}

export function useTodayActivities() {
  const activities = useLiveQuery(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filtra manualmente pois comparação de Date com índices pode falhar
    return db.activities.toArray().then(all => 
      all.filter(a => a.startedAt >= today)
    );
  });
  return activities || [];
}

export function useFeedbacks() {
  const feedbacks = useLiveQuery(() =>
    db.feedbacks.orderBy("createdAt").reverse().toArray()
  );
  return feedbacks || [];
}

export async function addActivity(activity: Omit<Activity, "id">) {
  return await db.activities.add(activity);
}

export async function updateActivity(id: number, changes: Partial<Activity>) {
  return await db.activities.update(id, changes);
}

export async function addFeedback(feedback: Omit<Feedback, "id">) {
  return await db.feedbacks.add(feedback);
}

export async function clearDatabase() {
  await db.activities.clear();
  await db.feedbacks.clear();
  await db.pendingInputs.clear();
}
