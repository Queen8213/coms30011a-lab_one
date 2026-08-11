import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import {
  PageShell,
  cardClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";
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
    <PageShell
      title="Edit task"
      action={
        <Link href="/" className={secondaryButtonClass}>
          Back to tasks
        </Link>
      }
    >
      <section className={`${cardClass} hover:shadow-sm`}>
        <form action={updateTask} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={task.id} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={task.title}
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
              defaultValue={task.description ?? ""}
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
                defaultValue={task.due_date}
                required
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
                defaultValue={task.topic}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Link href="/" className={secondaryButtonClass}>
              Cancel
            </Link>
            <button type="submit" className={primaryButtonClass}>
              Save changes
            </button>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
