import Database from "better-sqlite3";
import path from "path";
import { SCHEMA } from "./schema";

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
