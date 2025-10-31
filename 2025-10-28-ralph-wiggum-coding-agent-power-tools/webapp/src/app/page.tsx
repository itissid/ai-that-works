"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getLists } from "@/app/actions/lists";
import LogoutButton from "@/components/auth/LogoutButton";
import GraphViewWrapper from "@/components/graph/GraphViewWrapper";
import ListManagement from "@/components/lists/ListManagement";
import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationPreferences from "@/components/settings/NotificationPreferences";
import TemplateManagement from "@/components/templates/TemplateManagement";
import KanbanBoard from "@/components/todos/KanbanBoard";
import TodoList from "@/components/todos/TodoList";
import type { List } from "@/generated/prisma";
import { getUser, isAuthenticated } from "@/lib/auth";

type ViewMode = "list" | "kanban" | "graph";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [lists, setLists] = useState<List[]>([]);
  const user = getUser();

  const fetchLists = useCallback(async () => {
    const result = await getLists();
    if (result.success && result.lists) {
      setLists(result.lists);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      fetchLists();
    }
  }, [router, fetchLists]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Todo App</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <LogoutButton />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Lists</h2>
              <ListManagement />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Templates</h2>
              <TemplateManagement />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Settings</h2>
              <NotificationPreferences />
            </div>
          </aside>

          <main className="lg:col-span-9">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Todos</h2>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                      viewMode === "list"
                        ? "bg-white dark:bg-gray-800 shadow"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("kanban")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                      viewMode === "kanban"
                        ? "bg-white dark:bg-gray-800 shadow"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Kanban
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("graph")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                      viewMode === "graph"
                        ? "bg-white dark:bg-gray-800 shadow"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Graph
                  </button>
                </div>
              </div>
              {viewMode === "list" ? (
                <TodoList />
              ) : viewMode === "kanban" ? (
                <KanbanBoard />
              ) : (
                <GraphViewWrapper lists={lists} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
