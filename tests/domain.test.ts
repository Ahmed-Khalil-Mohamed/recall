import { test } from "node:test";
import assert from "node:assert/strict";
import { projects, findProject } from "../src/projects";
import { DomainError, cash, type Entry } from "../src/contracts";
import { splitCents, balances, settlements } from "../src/settlements";
import { schedule } from "../apps/recall/domain";
const now = new Date("2026-10-12T12:00:00Z");
const p = (id: string) => findProject(id)!;
const rejects = (fn: () => unknown, code: string) =>
  assert.throws(
    fn,
    (e: unknown) => e instanceof DomainError && e.code === code,
  );
for (const project of projects) {
  test(`${project.name}: samples yield finite, renderable metrics and recognized states`, () => {
    const entries = project.seed(now).map((data, i) => ({
      id: String(i),
      version: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      data,
    }));
    assert.ok(entries.length);
    assert.equal(project.metrics(entries, now).length, 3);
    for (const e of entries) {
      assert.ok(project.title(e.data));
      assert.ok(project.statuses[project.status(e.data, now)]);
    }
    for (const m of project.metrics(entries, now)) {
      assert.ok(m.label.ar && m.label.en);
      assert.ok(typeof m.value === "string" || Number.isFinite(m.value));
    }
  });
}
test("Recall produces deterministic intervals and blocks early repeat reviews", () => {
  const project = p("recall");
  const d = project.seed(now)[0];
  assert.equal(schedule(d, "good", now).interval, 1);
  assert.equal(schedule(d, "easy", now).interval, 4);
  assert.equal(Date.parse(schedule(d, "again", now).dueAt) - +now, 600000);
  let next = project.act(d, "review", { grade: "good" }, now);
  rejects(() => project.act(next, "review", { grade: "good" }, now), "not_due");
  next = project.act(next, "review", { grade: "good" }, new Date(next.dueAt));
  assert.equal(next.interval, 6);
});
test("Currency display preserves cents above Number safe integer range", () => {
  assert.equal(cash(200000000000000001n), "EGP 2,000,000,000,000,000.01");
  assert.equal(cash(-1n), "-EGP 0.01");
});
