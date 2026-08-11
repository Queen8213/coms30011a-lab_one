import Link from "next/link";
import db from "@/lib/db";
import { isOverdue } from "@/lib/overdue";
import { archiveTask, createTask } from "./actions";

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

const SORT_COLUMNS = ["topic", "status", "due_date"] as const;
type SortColumn = (typeof SORT_COLUMNS)[number];

function isSortColumn(value: string | undefined): value is SortColumn {
  return SORT_COLUMNS.includes(value as SortColumn);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortParam } = await searchParams;
  const sort = isSortColumn(sortParam) ? sortParam : undefined;

  const tasks = db
    .prepare(
      `SELECT * FROM tasks WHERE is_archived = 0${
        sort ? ` ORDER BY ${sort}` : ""
      }`
    )
    .all() as Task[];

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 py-16 px-8 bg-white dark:bg-black">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Tasks
          </h1>
          <Link href="/archived">View archived</Link>
        </div>

        <form action={createTask} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="due_date">Due date</label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              required
              autoComplete="off"
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="topic">Topic</label>
            <input
              id="topic"
              name="topic"
              type="text"
              required
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <button type="submit">Add task</button>
        </form>

        <div className="flex gap-4 text-sm">
          <span>Sort by:</span>
          <Link href="/?sort=topic" aria-current={sort === "topic"}>
            Topic
          </Link>
          <Link href="/?sort=status" aria-current={sort === "status"}>
            Status
          </Link>
          <Link href="/?sort=due_date" aria-current={sort === "due_date"}>
            Due date
          </Link>
        </div>

        <ul>
          {tasks.map((task) => {
            const overdue = isOverdue(task.due_date, task.status);

            return (
              <li key={task.id}>
                <p>
                  title: {task.title}
                  {overdue && (
                    <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white">
                      Overdue
                    </span>
                  )}
                </p>
                <p>description: {task.description}</p>
                <p>due_date: {task.due_date}</p>
                <p>topic: {task.topic}</p>
                <p>status: {task.status}</p>
                <div className="flex gap-2">
                  <Link href={`/tasks/${task.id}/edit`}>Edit</Link>
                  <form action={archiveTask}>
                    <input type="hidden" name="id" value={task.id} />
                    <button type="submit">Archive</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
