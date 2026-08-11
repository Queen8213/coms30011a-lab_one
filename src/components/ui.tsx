import type { ReactNode } from "react";

// Shared class strings, kept as whole literals so Tailwind's scanner sees them.

export const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10";

export const labelClass =
  "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

export const cardClass =
  "rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900";

const pillBase =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

const statusPillStyles: Record<string, string> = {
  todo: "bg-zinc-100 text-zinc-700 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  "in-progress":
    "bg-blue-100 text-blue-700 ring-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800",
  complete:
    "bg-green-100 text-green-700 ring-green-300 dark:bg-green-950 dark:text-green-300 dark:ring-green-800",
};

export function StatusPill({ status }: { status: string }) {
  const style = statusPillStyles[status] ?? statusPillStyles.todo;
  return <span className={`${pillBase} ${style}`}>{status}</span>;
}

export function OverdueBadge() {
  return (
    <span
      className={`${pillBase} bg-red-100 text-red-700 ring-red-300 dark:bg-red-950 dark:text-red-300 dark:ring-red-800`}
    >
      Overdue
    </span>
  );
}

// Selected-state styling for the three status buttons on a task row.
const statusButtonSelected: Record<string, string> = {
  todo: "bg-zinc-200 text-zinc-900 ring-zinc-400 dark:bg-zinc-700 dark:text-zinc-50 dark:ring-zinc-500",
  "in-progress":
    "bg-blue-600 text-white ring-blue-600 dark:bg-blue-600 dark:text-white dark:ring-blue-500",
  complete:
    "bg-green-600 text-white ring-green-600 dark:bg-green-600 dark:text-white dark:ring-green-500",
};

export function statusButtonClass(status: string, isCurrent: boolean): string {
  const base =
    "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors";
  if (isCurrent) {
    return `${base} cursor-default ${
      statusButtonSelected[status] ?? statusButtonSelected.todo
    }`;
  }
  return `${base} bg-white text-zinc-600 ring-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100`;
}

export function sortLinkClass(isActive: boolean): string {
  const base =
    "rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors";
  return isActive
    ? `${base} bg-zinc-900 text-white ring-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-100`
    : `${base} bg-white text-zinc-600 ring-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100`;
}

export function PageShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-full flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {action}
        </header>
        {children}
      </main>
    </div>
  );
}

export function FieldRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="shrink-0 text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
      {children}
    </div>
  );
}
