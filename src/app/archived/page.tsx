import Link from "next/link";
import db from "@/lib/db";
import {
  EmptyState,
  FieldRow,
  PageShell,
  StatusPill,
  cardClass,
  secondaryButtonClass,
} from "@/components/ui";

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
    <PageShell
      title="Archived tasks"
      action={
        <Link href="/" className={secondaryButtonClass}>
          Back to tasks
        </Link>
      }
    >
      {tasks.length === 0 ? (
        <EmptyState>Nothing archived yet.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-4">
          {tasks.map((task) => (
            <li key={task.id} className={`${cardClass} opacity-80`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {task.title}
                </h3>
                <StatusPill status={task.status} />
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
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
