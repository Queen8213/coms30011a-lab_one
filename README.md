# coms30011a-lab-one

A local-first todo application built with Next.js and SQLite. It runs entirely on your own machine: there are no accounts, no sign-in, no external services, and nothing is deployed. Tasks are stored in a SQLite file sitting in the project directory, so everything you create stays on your computer and is still there the next time you start the app.

## Prerequisites

- **Node.js v24.14.0** — the version this project was developed and tested on. Anything from **v20.9.0** upwards should work, since that is the minimum Next.js 16 requires.
- **npm 11.9.0** — ships with Node, and is the only package manager used here.

Check what you have with `node -v` and `npm -v`.

## Setup

```bash
git clone https://github.com/Queen8213/coms30011a-lab_one.git
cd coms30011a-lab_one
npm install
npm run dev
```

Then open <http://localhost:3000>.

**There is no database setup step.** The SQLite file (`todo.db`) is not part of the repository — it is created automatically in the project root the first time the app connects, with the table applied for you. There is no migration to run, no `.env` file to write, and no configuration to fill in. A fresh clone starts with an empty task list and works immediately.

## Running the tests

```bash
npm test
```

This runs the whole suite once and exits. The tests use their own throwaway in-memory database, so running them never touches `todo.db` or your real tasks.

## Features

- **Create tasks** with a title, description, due date and topic.
- **Edit tasks** — change the title, description, due date or topic of an existing task.
- **Change status** — set any task to `todo`, `in-progress` or `complete` straight from the list.
- **Archive tasks** to remove them from the main list while keeping them on a separate archived page. Nothing is deleted.
- **Sort** the task list by topic, status or due date.
- **Overdue indication** — a task past its due date and not yet complete is flagged in the list. A task due *today* is not overdue, since it may still be due later in the day.
- **Persistent data** — everything is written to SQLite on disk, so your tasks survive restarting the dev server and rebooting your machine.

## Documentation

See **[DOCUMENTATION.md](./DOCUMENTATION.md)** for:

- **Third-party code** — every dependency and why it was chosen.
- **Database design** — the `tasks` table column by column, its constraints, and the reasoning behind the single-table design, archiving as a flag, and computing overdue at read time.
- **Full run instructions** — every npm script, the native-module build requirements, and what to do if port 3000 is already in use.
