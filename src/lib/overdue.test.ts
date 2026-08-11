import { describe, expect, it } from "vitest";
import { isOverdue } from "./overdue";

const PAST = "2020-01-01";
const FUTURE = "2999-01-01";

describe("isOverdue", () => {
  it("returns true for a past due date with status 'todo'", () => {
    expect(isOverdue(PAST, "todo")).toBe(true);
  });

  it("returns false for a past due date with status 'complete'", () => {
    expect(isOverdue(PAST, "complete")).toBe(false);
  });

  it("returns false for a future due date regardless of status", () => {
    expect(isOverdue(FUTURE, "todo")).toBe(false);
    expect(isOverdue(FUTURE, "in-progress")).toBe(false);
  });
});
