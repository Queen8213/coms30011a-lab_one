import Database from "better-sqlite3";
import path from "path";

const SCHEMA = `
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

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const db = new Database(path.join(process.cwd(), "todo.db"));
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  return db;
}

// Reuse the connection across Next.js dev-server hot reloads so we don't
// leak file handles by re-opening todo.db on every module reload.
const db = global.__db ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  global.__db = db;
}

export default db;
