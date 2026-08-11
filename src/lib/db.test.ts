import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SCHEMA } from "./schema";

// Every test runs against a fresh in-memory database built from the same
// SCHEMA the app uses. The real todo.db is never opened.
let db: Database.Database;

beforeEach(() => {
  db = new Database(":memory:");
  db.exec(SCHEMA);
});

afterEach(() => {
  db.close();
});

function insertTask(
  title = "Write lab report",
  description: string | null = "Cover methodology and results",
  dueDate = "2026-08-20",
  topic = "COMS30011A"
) {
  return db
    .prepare(
      `INSERT INTO tasks (title, description, due_date, topic)
       VALUES (?, ?, ?, ?)`
    )
    .run(title, description, dueDate, topic);
}

type TaskRow = {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  topic: string;
  status: string;
  is_archived: number;
};

describe("inserting a task", () => {
  it("stores all four fields and defaults status to 'todo'", () => {
    insertTask();

    const task = db
      .prepare("SELECT * FROM tasks")
      .get() as TaskRow;

    expect(task.title).toBe("Write lab report");
    expect(task.description).toBe("Cover methodology and results");
    expect(task.due_date).toBe("2026-08-20");
    expect(task.topic).toBe("COMS30011A");
    expect(task.status).toBe("todo");
    expect(task.is_archived).toBe(0);
  });
});

describe("archiving a task", () => {
  it("excludes it from the active list but keeps it retrievable", () => {
    const { lastInsertRowid: activeId } = insertTask("Still active");
    const { lastInsertRowid: archivedId } = insertTask("To be archived");

    db.prepare("UPDATE tasks SET is_archived = 1 WHERE id = ?").run(archivedId);

    const active = db
      .prepare("SELECT * FROM tasks WHERE is_archived = 0")
      .all() as TaskRow[];

    expect(active).toHaveLength(1);
    expect(active[0].id).toBe(activeId);
    expect(active.map((t) => t.title)).not.toContain("To be archived");

    // Still in the table — archiving hides it, it does not delete it.
    const archived = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(archivedId) as TaskRow;

    expect(archived.title).toBe("To be archived");
    expect(archived.is_archived).toBe(1);

    expect(db.prepare("SELECT * FROM tasks").all()).toHaveLength(2);
  });
});
