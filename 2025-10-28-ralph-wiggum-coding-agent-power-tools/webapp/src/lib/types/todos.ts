import type { Todo, TodoStatus } from "@/generated/prisma";

export type { Todo, TodoStatus };

export interface CreateTodoInput {
  title: string;
  description?: string;
  status?: TodoStatus;
  listId?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  status?: TodoStatus;
  listId?: string | null;
}

export interface TodoResult {
  success: boolean;
  todo?: Todo;
  error?: string;
}

export interface TodosResult {
  success: boolean;
  todos?: Todo[];
  error?: string;
}
