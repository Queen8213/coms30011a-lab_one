import Link from "next/link";
import db from "@/lib/db";

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

export default function ArchivedTasksPage() {
  const tasks = db
    .prepare("SELECT * FROM tasks WHERE is_archived = 1")
    .all() as Task[];

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 py-16 px-8 bg-white dark:bg-black">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Archived tasks
          </h1>
          <Link href="/">Back to tasks</Link>
        </div>

        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <p>title: {task.title}</p>
              <p>description: {task.description}</p>
              <p>due_date: {task.due_date}</p>
              <p>topic: {task.topic}</p>
              <p>status: {task.status}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
