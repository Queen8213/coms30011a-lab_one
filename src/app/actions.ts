"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function updateTask(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();

  if (!id || !title || !dueDate || !topic) {
    throw new Error("Title, due date, and topic are required");
  }

  db.prepare(
    `UPDATE tasks
     SET title = ?, description = ?, due_date = ?, topic = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(title, description || null, dueDate, topic, id);

  revalidatePath("/");
  redirect("/");
}

export async function archiveTask(formData: FormData) {
  const id = Number(formData.get("id"));

  if (!id) {
    throw new Error("Task id is required");
  }

  db.prepare(`UPDATE tasks SET is_archived = 1 WHERE id = ?`).run(id);

  revalidatePath("/");
  revalidatePath("/archived");
}
