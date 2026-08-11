// The three values permitted by the CHECK constraint on tasks.status below.
// Kept here so the constraint and the application share one definition.
export const TASK_STATUSES = ["todo", "in-progress", "complete"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// Kept separate from db.ts so tests can build a fresh database from the same
// definition without importing db.ts, which opens todo.db on module load.
export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('todo','in-progress','complete')) DEFAULT 'todo',
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;
