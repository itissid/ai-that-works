"use client";

import type {
  CreateTodoInput,
  Todo,
  TodoResult,
  TodosResult,
  UpdateTodoInput,
} from "./types/todos";

const TODOS_KEY = "todos_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedTodos {
  todos: Todo[];
  timestamp: number;
}

export function getCachedTodos(): Todo[] | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(TODOS_KEY);
  if (!stored) return null;

  const cached: CachedTodos = JSON.parse(stored);
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    localStorage.removeItem(TODOS_KEY);
    return null;
  }

  return cached.todos;
}

export function setCachedTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return;
  const cached: CachedTodos = {
    todos,
    timestamp: Date.now(),
  };
  localStorage.setItem(TODOS_KEY, JSON.stringify(cached));
}

export function clearCachedTodos(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TODOS_KEY);
}

export async function fetchTodos(): Promise<TodosResult> {
  try {
    const response = await fetch("/api/todos", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || "Failed to fetch todos" };
    }

    const data = await response.json();
    if (data.success && data.todos) {
      setCachedTodos(data.todos);
    }
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch todos",
    };
  }
}

export async function fetchTodosByList(listId: string): Promise<TodosResult> {
  try {
    const response = await fetch(`/api/todos?listId=${listId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || "Failed to fetch todos" };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch todos by list",
    };
  }
}

export async function fetchTodo(todoId: string): Promise<TodoResult> {
  try {
    const response = await fetch(`/api/todos/${todoId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || "Todo not found" };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch todo",
    };
  }
}

export async function createTodo(input: CreateTodoInput): Promise<TodoResult> {
  try {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || "Failed to create todo" };
    }

    const data = await response.json();
    clearCachedTodos();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create todo",
    };
  }
}

export async function updateTodo(
  todoId: string,
  input: UpdateTodoInput,
): Promise<TodoResult> {
  try {
    const response = await fetch(`/api/todos/${todoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || "Failed to update todo" };
    }

    const data = await response.json();
    clearCachedTodos();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update todo",
    };
  }
}

export async function deleteTodo(todoId: string): Promise<TodoResult> {
  try {
    const response = await fetch(`/api/todos/${todoId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || "Failed to delete todo" };
    }

    const data = await response.json();
    clearCachedTodos();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete todo",
    };
  }
}
