// Local-time "today" as YYYY-MM-DD. Deliberately not toISOString(), which is
// UTC and would shift the date for anyone not on UTC.
function todayAsISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isOverdue(dueDate: string, status: string): boolean {
  return dueDate < todayAsISODate() && status !== "complete";
}
