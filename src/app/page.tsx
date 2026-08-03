import Link from "next/link";
import db from "@/lib/db";
import { createTask } from "./actions";

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

function todayAsISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const tasks = db.prepare("SELECT * FROM tasks").all() as Task[];
  const today = todayAsISODate();

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 py-16 px-8 bg-white dark:bg-black">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Tasks
        </h1>

        <form action={createTask} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" type="text" required />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="due_date">Due date</label>
            <input id="due_date" name="due_date" type="date" required />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="topic">Topic</label>
            <input id="topic" name="topic" type="text" required />
          </div>

          <button type="submit">Add task</button>
        </form>

        <ul>
          {tasks.map((task) => {
            const isOverdue = task.due_date < today && task.status !== "complete";

            return (
              <li key={task.id}>
                <p>
                  title: {task.title}
                  {isOverdue && (
                    <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white">
                      Overdue
                    </span>
                  )}
                </p>
                <p>description: {task.description}</p>
                <p>due_date: {task.due_date}</p>
                <p>topic: {task.topic}</p>
                <p>status: {task.status}</p>
                <p>
                  <Link href={`/tasks/${task.id}/edit`}>Edit</Link>
                </p>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
