import { notFound } from "next/navigation";
import db from "@/lib/db";
import { updateTask } from "@/app/actions";

type Task = {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  topic: string;
  status: string;
  is_archived: number;
  created_at: string;
  updated_at: string;
};

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(Number(id)) as Task | undefined;

  if (!task) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 py-16 px-8 bg-white dark:bg-black">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Edit task
        </h1>

        <form action={updateTask} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={task.id} />

          <div className="flex flex-col gap-1">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={task.title}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              defaultValue={task.description ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="due_date">Due date</label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              defaultValue={task.due_date}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="topic">Topic</label>
            <input
              id="topic"
              name="topic"
              type="text"
              defaultValue={task.topic}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <button type="submit">Save changes</button>
        </form>
      </main>
    </div>
  );
}
