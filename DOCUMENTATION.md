# Documentation

## Third-Party Code

Every package in `package.json`, and why it is there.

### Dependencies

| Package | Version | Why |
| --- | --- | --- |
| `better-sqlite3` | `^13.0.2` | SQLite driver with a **synchronous** API. This is the deciding property: server components and server actions can query directly (`db.prepare(...).all()`) with no `await`, no connection pool, and no callback plumbing. The database is a single file, so there is no server process to run alongside the app. |
| `next` | `16.2.12` | Application framework. Server Components render the task list on the server with direct database access, and Server Actions let the create/edit/archive forms mutate data without hand-writing an API route or any client-side fetch code. Pinned to an exact version because the App Router's conventions shift between majors. |
| `react` | `19.2.4` | The rendering library Next builds on. Required at this exact version by Next 16 — Server Components and the `<form action={serverAction}>` binding depend on React 19 internals. |
| `react-dom` | `19.2.4` | React's DOM renderer, including the hydration pass on the client. Kept at exactly the same version as `react`; the two are released together and mismatching them breaks hydration. |

### Dev Dependencies

| Package | Version | Why |
| --- | --- | --- |
| `@tailwindcss/postcss` | `^4` | The PostCSS plugin through which Tailwind v4 runs. In v4 the Tailwind engine moved into this separate plugin package, so it is required for any Tailwind class to compile — it is not optional tooling. |
| `@types/better-sqlite3` | `^9.6.0` | `better-sqlite3` ships no type declarations of its own, so this supplies `Database.Database`, the `.prepare()`/`.run()` signatures, and the types used in `src/lib/db.ts`. |
| `@types/node` | `^20` | Types for the Node built-ins the server code touches — `path` and `process.cwd()` in `src/lib/db.ts`. |
| `@types/react` | `^19` | Types for component props, JSX, and hooks. |
| `@types/react-dom` | `^19` | Types for the DOM-specific React surface. |
| `eslint` | `^9` | Linter, run via `npm run lint`. |
| `eslint-config-next` | `16.2.12` | Next's own rule set, which catches App Router mistakes a generic config misses (e.g. client-only APIs in server components). Held at the same exact version as `next` so the rules match the framework build. |
| `tailwindcss` | `^4` | All styling in the app is Tailwind utility classes applied inline in JSX. There is no component library and no hand-written CSS beyond `globals.css`. |
| `typescript` | `^5` | The whole codebase is TypeScript. Type-check with `npx tsc --noEmit`. |
| `vitest` | `^4.1.10` | Test runner. Chosen because it executes TypeScript and ESM directly with no separate transform/Babel configuration, and its config reuses the Vite `resolve.alias` mechanism — so the `@/` path alias works in tests with a four-line config file. |

> **Known version skew:** `@types/better-sqlite3` is on major 9 while `better-sqlite3` itself is on major 13. The types are close enough for the small surface this project uses (`prepare`, `run`, `all`, `get`, `exec`, `pragma`, `close`) and `tsc --noEmit` passes, but they are not a guaranteed match for the runtime library.

## Database Design

One SQLite database, `todo.db`, in the repository root. It is created automatically on first connection and is **not** committed (it is listed in `.gitignore`).

The schema lives in `src/lib/schema.ts` and is applied by `src/lib/db.ts` on connect, using `CREATE TABLE IF NOT EXISTS` — so startup is idempotent and there is no separate migration step. The connection also sets `journal_mode = WAL`, and is cached on `globalThis` outside production so Next's dev-server hot reloads reuse one connection instead of leaking a file handle per reload.

### Table: `tasks`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Surrogate key. Used in the edit route (`/tasks/[id]/edit`) and as the archive form's hidden field. |
| `title` | `TEXT` | `NOT NULL` | Required. |
| `description` | `TEXT` | *(nullable — the only nullable column)* | Optional; the server action writes `NULL` rather than `''` when the field is left blank. |
| `due_date` | `TEXT` | `NOT NULL` | ISO `YYYY-MM-DD`, matching what `<input type="date">` submits. |
| `topic` | `TEXT` | `NOT NULL` | Free text, not a foreign key. See design decision 1. |
| `status` | `TEXT` | `NOT NULL`, `CHECK (status IN ('todo','in-progress','complete'))`, `DEFAULT 'todo'` | The `CHECK` enforces the enum in the database, so an invalid status is rejected even if application validation is bypassed. |
| `is_archived` | `INTEGER` | `NOT NULL`, `DEFAULT 0` | `0`/`1`. SQLite has no boolean type; integer is the conventional stand-in. |
| `created_at` | `TEXT` | `NOT NULL`, `DEFAULT (datetime('now'))` | Set by SQLite on insert. |
| `updated_at` | `TEXT` | `NOT NULL`, `DEFAULT (datetime('now'))` | Same default, but rewritten explicitly by the update action (`updated_at = datetime('now')`). |

**A note on date formats:** `due_date` is a plain calendar date (`2026-08-20`), whereas `datetime('now')` produces a UTC timestamp (`2026-08-20 14:30:00`). They are not interchangeable, and only `due_date` participates in the overdue comparison.

**Constraints in full:**

- **`id`** — `INTEGER PRIMARY KEY AUTOINCREMENT`, assigned by SQLite.
- **`title`** — `TEXT NOT NULL`.
- **`description`** — `TEXT`, the only nullable column. Blank input is stored as `NULL`, not `''`.
- **`due_date`** — `TEXT NOT NULL`, ISO `YYYY-MM-DD`.
- **`topic`** — `TEXT NOT NULL` free text. It looks like it should reference something, but there is no `topics` table and no foreign key; see design decision 1.
- **`status`** — `TEXT NOT NULL DEFAULT 'todo'`, constrained by `CHECK (status IN ('todo','in-progress','complete'))`.
- **`is_archived`** — `INTEGER NOT NULL DEFAULT 0`, holding `0` or `1`, since SQLite has no boolean type.
- **`created_at`** / **`updated_at`** — `TEXT NOT NULL DEFAULT (datetime('now'))`, a UTC timestamp.

There is one entity and no foreign keys: the database genuinely has a single table.

### Relationships

There are none. `tasks` is a single standalone table with no foreign keys and no join tables.

### Design decision 1 — why one table is sufficient

The only candidate for extraction is `topic`. Splitting it into a `topics` table plus a foreign key would add a join to every read and an insert-or-select on every write, in exchange for nothing this application does: topics have no attributes of their own, no independent lifetime, and no many-to-many relationship with tasks. A topic here is a label, not an entity.

The condition that would justify normalising is a concrete one: if topics acquire their own data (a colour, a sort order, an owner), or if renaming a topic must update every task carrying it atomically. Neither is a requirement now, so the join is cost without benefit.

### Design decision 2 — why archiving is a flag, not a separate table or a delete

`is_archived` is a column on the row. The two alternatives are both worse here:

- **Deleting** destroys the record. Archiving exists precisely so a task can leave the active list and still be read afterwards, which `/archived` does. A delete cannot support that.
- **A separate `archived_tasks` table** would duplicate all nine columns and turn archiving into a move — a delete plus an insert, two writes that must not half-fail — while every "all tasks regardless of state" query becomes a `UNION`. The duplicated schema then has to be kept in step with the original forever.

With a flag, archiving is one `UPDATE`, unarchiving would be the same `UPDATE` reversed, the active list adds one `WHERE is_archived = 0`, and no data moves. The trade-off accepted is that every active-list query must remember that filter.

### Design decision 3 — why overdue is derived at read time

Overdue is computed in `src/lib/overdue.ts`:

```ts
isOverdue(dueDate, status) === dueDate < todayAsISODate() && status !== "complete"
```

It is deliberately **not** stored, for two independent reasons.

**It is a function of the current date, not of the row.** A task becomes overdue at midnight with no write occurring. A stored column would therefore be wrong every morning until something recomputed it, which means a scheduled job whose only purpose is to repair a value that can be calculated correctly on demand for free.

**It is a different axis from `status`.** `status` tracks progress (`todo` → `in-progress` → `complete`); overdue tracks timeliness. They are orthogonal — a task can be `in-progress` *and* overdue. Adding `'overdue'` to the status enum would force a single column to carry two independent facts, and recording that a task is overdue would destroy the record of whether work had started.

Deriving it also keeps the rule in one place: the `status !== 'complete'` clause means a finished task is never flagged, however late it was, and the strict `<` means a task due *today* is not yet overdue — it may still be due later in the day.

### The three axes, side by side

Progress and archiving are two independent stored columns; overdue is neither of them, and is not stored at all.

**Axis 1 — progress, stored in `status`.** Three values, fixed by the `CHECK` constraint: `'todo'`, `'in-progress'`, `'complete'`. An `INSERT` applies the `'todo'` default.

**Axis 2 — visibility, stored in `is_archived`.** Two values: `0` (active) and `1` (archived). An `INSERT` applies the `0` default.

The two are independent. A task holds one `status` value and one `is_archived` value at the same time, so archiving never changes `status` and changing `status` never archives.

**Axis 3 — overdue, stored nowhere.** `isOverdue` in `src/lib/overdue.ts` recomputes it on every render: `due_date` is before today **and** `status` is not `'complete'`. It flips at midnight with no write occurring, which is precisely why it cannot be a column or a fourth status value.

**Two details reflect the code as it stands, not an intended design:**

- The three `status` values are what the `CHECK` constraint permits, not a working feature. **No code writes `status`** — `src/app/actions.ts` never sets it — so in practice every row keeps the `'todo'` default.
- There is **no path from archived back to active**. `archiveTask` only ever sets the flag to `1`; nothing sets it to `0`. Archiving is currently one-way.

## Running It

### Node version

`package.json` declares no `engines` field. The binding constraint comes from Next 16.2.12, which requires **Node >= 20.9.0**. Development and testing were done on **Node v24.14.0** with npm 11.9.0. Any Node >= 20.9 should work; Node 22 LTS or 24 is the safe choice.

### From a clean clone

```bash
git clone https://github.com/Queen8213/coms30011a-lab_one.git
cd coms30011a-lab_one
npm install
npm run dev
```

Then open <http://localhost:3000>.

There is no `.env` file, no configuration to fill in, and no database setup step. `todo.db` is not in the repository; `src/lib/db.ts` creates it and applies the schema on the first connection, so a clean clone starts with an empty task list and works immediately.

`npm install` compiles or downloads a prebuilt binary for `better-sqlite3`, which is a native module. On a platform with no prebuilt binary available, this step needs a C/C++ toolchain (Xcode Command Line Tools on macOS, `build-essential` on Debian/Ubuntu).

### All commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload, on <http://localhost:3000>. |
| `npm test` | Runs the whole Vitest suite once and exits (`vitest run`). |
| `npm run build` | Production build. |
| `npm start` | Serves the production build — run `npm run build` first. |
| `npm run lint` | ESLint. |
| `npx tsc --noEmit` | Type-check without emitting output. |

### Tests

`npm test` runs everything in one command. The suite is two files:

- `src/lib/db.test.ts` — insert defaults and archive filtering
- `src/lib/overdue.test.ts` — the `isOverdue` rules

Each database test builds a fresh `:memory:` SQLite database from the same `SCHEMA` constant the application uses, and closes it afterwards. **The tests never open `todo.db`**, so running them cannot read or damage real data.

### If the dev server will not start

If port 3000 is already held — `npm run dev` reporting that another dev server is running, or the page hanging with no response — clear it and retry:

```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```
