import Link from "next/link";
import db from "@/lib/db";
import { isOverdue } from "@/lib/overdue";
import { TASK_STATUSES } from "@/lib/schema";
import {
  EmptyState,
  FieldRow,
  OverdueBadge,
  PageShell,
  StatusPill,
  cardClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  sortLinkClass,
  statusButtonClass,
} from "@/components/ui";
import { archiveTask, createTask, updateTaskStatus } from "./actions";

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
    <PageShell
      title="Tasks"
      action={
        <Link href="/archived" className={secondaryButtonClass}>
          View archived
        </Link>
      }
    >
      <section className={`${cardClass} mb-10 hover:shadow-sm`}>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          New task
        </h2>

        <form action={createTask} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="due_date" className={labelClass}>
                Due date
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                required
                autoComplete="off"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="topic" className={labelClass}>
                Topic
              </label>
              <input
                id="topic"
                name="topic"
                type="text"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button type="submit" className={primaryButtonClass}>
              Add task
            </button>
          </div>
        </form>
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Sort by
        </span>
        <Link
          href="/?sort=topic"
          aria-current={sort === "topic"}
          className={sortLinkClass(sort === "topic")}
        >
          Topic
        </Link>
        <Link
          href="/?sort=status"
          aria-current={sort === "status"}
          className={sortLinkClass(sort === "status")}
        >
          Status
        </Link>
        <Link
          href="/?sort=due_date"
          aria-current={sort === "due_date"}
          className={sortLinkClass(sort === "due_date")}
        >
          Due date
        </Link>
      </div>

      {tasks.length === 0 ? (
        <EmptyState>No tasks yet. Add one using the form above.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-4">
          {tasks.map((task) => {
            const overdue = isOverdue(task.due_date, task.status);

            return (
              <li key={task.id} className={cardClass}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={task.status} />
                    {overdue && <OverdueBadge />}
                  </div>
                </div>

                {task.description && (
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {task.description}
                  </p>
                )}

                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                  <FieldRow label="Due" value={task.due_date} />
                  <FieldRow label="Topic" value={task.topic} />
                </dl>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <form action={updateTaskStatus} className="flex flex-wrap gap-1.5">
                    <input type="hidden" name="id" value={task.id} />
                    {TASK_STATUSES.map((status) => (
                      <button
                        key={status}
                        type="submit"
                        name="status"
                        value={status}
                        disabled={status === task.status}
                        aria-current={status === task.status}
                        className={statusButtonClass(
                          status,
                          status === task.status
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </form>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tasks/${task.id}/edit`}
                      className={secondaryButtonClass}
                    >
                      Edit
                    </Link>
                    <form action={archiveTask}>
                      <input type="hidden" name="id" value={task.id} />
                      <button type="submit" className={secondaryButtonClass}>
                        Archive
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
