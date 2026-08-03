"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();

  if (!title || !dueDate || !topic) {
    throw new Error("Title, due date, and topic are required");
  }

  db.prepare(
    `INSERT INTO tasks (title, description, due_date, topic)
     VALUES (?, ?, ?, ?)`
  ).run(title, description || null, dueDate, topic);

  revalidatePath("/");
}
