import { prisma } from "@/lib/prisma";
import type {
  CreateTodoInput,
  TodoResult,
  TodosResult,
  UpdateTodoInput,
} from "./types/todos";

export async function createTodo(
  userId: string,
  input: CreateTodoInput,
): Promise<TodoResult> {
  try {
    const todo = await prisma.todo.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status || "TODO",
        userId,
        listId: input.listId,
      },
    });

    return { success: true, todo };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create todo",
    };
  }
}

export async function getTodo(
  todoId: string,
  userId: string,
): Promise<TodoResult> {
  try {
    const todo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        userId,
      },
    });

    if (!todo) {
      return { success: false, error: "Todo not found" };
    }

    return { success: true, todo };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get todo",
    };
  }
}

export async function getTodos(userId: string): Promise<TodosResult> {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, todos };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get todos",
    };
  }
}

export async function getTodosByList(
  listId: string,
  userId: string,
): Promise<TodosResult> {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        listId,
        userId,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, todos };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get todos by list",
    };
  }
}

export async function updateTodo(
  todoId: string,
  userId: string,
  input: UpdateTodoInput,
): Promise<TodoResult> {
  try {
    const existing = await prisma.todo.findFirst({
      where: {
        id: todoId,
        userId,
      },
    });

    if (!existing) {
      return { success: false, error: "Todo not found" };
    }

    const todo = await prisma.todo.update({
      where: { id: todoId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.listId !== undefined && { listId: input.listId }),
      },
    });

    return { success: true, todo };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update todo",
    };
  }
}

export async function deleteTodo(
  todoId: string,
  userId: string,
): Promise<TodoResult> {
  try {
    const existing = await prisma.todo.findFirst({
      where: {
        id: todoId,
        userId,
      },
    });

    if (!existing) {
      return { success: false, error: "Todo not found" };
    }

    const todo = await prisma.todo.delete({
      where: { id: todoId },
    });

    return { success: true, todo };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete todo",
    };
  }
}
