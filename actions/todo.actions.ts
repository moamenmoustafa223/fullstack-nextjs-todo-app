"use server";

import { ITodo } from "@/interfaces";
import { Prisma, PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export const getUserTodoListAction = async ({ userId }: { userId: string | null }): Promise<Array<ITodo>> => {
  try {
    return await prisma.todo.findMany({
      where: { user_id: userId as string },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("❌ getUserTodoListAction error:", error);
    throw new Error("Failed to fetch todo list. Please try again later.");
  }
};

export const createTodoAction = async ({
  title,
  body,
  completed,
  userId,
}: {
  title: string;
  body?: string | undefined;
  completed: boolean;
  userId: string | null;
}): Promise<void> => {
  try {
    await prisma.todo.create({
      data: {
        title,
        body,
        completed,
        user_id: userId as string,
      },
    });

    revalidatePath("/");
  } catch (error) {
    console.error("❌ createTodoAction error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("A todo with the same title already exists.");
      }
    }

    throw new Error("Failed to create todo. Please try again later.");
  }
};

export const deleteTodoAction = async ({ id }: { id: string }): Promise<void> => {
  try {
    await prisma.todo.delete({ where: { id } });
    revalidatePath("/");
  } catch (error) {
    console.error("❌ deleteTodoAction error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error("Todo not found or already deleted.");
      }
    }

    throw new Error("Failed to delete todo. Please try again later.");
  }
};

export const updateTodoAction = async ({ id, title, body, completed }: ITodo): Promise<void> => {
  try {
    await prisma.todo.update({
      where: { id },
      data: { title, body, completed },
    });

    revalidatePath("/");
  } catch (error) {
    console.error("❌ updateTodoAction error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error("Todo not found. Cannot update.");
      }
    }

    throw new Error("Failed to update todo. Please try again later.");
  }
};
