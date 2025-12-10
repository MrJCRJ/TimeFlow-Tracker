"use client";

import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {session.user?.name || "Usuário"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {session.user?.email}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
        >
          Sair
        </button>
      </div>
    </header>
  );
}