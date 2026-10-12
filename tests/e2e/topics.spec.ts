import { test, expect } from "@playwright/test";
test("topic library filters cards and opens the matching review", async ({
  page,
}) => {
  await page.goto("/recall");
  await page
    .getByRole("button", { name: "Explore with sample data", exact: true })
    .click();
  await expect(page.locator(".record-card")).toHaveCount(2);
  await page
    .locator(".topic-switches")
    .getByRole("button", { name: "Software design" })
    .click();
  await expect(page.locator(".record-card")).toHaveCount(1);
  await expect(page.locator(".record-card .record-title")).toHaveText(
    "Why store currency as integer minor units?",
  );
  await page.locator(".record-card .record-title").click();
  await expect(page.getByRole("dialog")).toContainText(
    "Why store currency as integer minor units?",
  );
  await page
    .getByRole("button", { name: "Close / إغلاق", exact: true })
    .click();
  await page
    .locator(".topic-switches")
    .getByRole("button", { name: "All topics" })
    .click();
  await expect(page.locator(".record-card")).toHaveCount(2);
});
