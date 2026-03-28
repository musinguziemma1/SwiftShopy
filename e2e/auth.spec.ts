import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••").first()).toBeVisible();
  });

  test("should show signup page", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.getByPlaceholder("Sarah Nakato")).toBeVisible();
  });

  test("should login with demo seller", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("seller@swiftshopy.com");
    await page.getByPlaceholder("••••••••").first().fill("seller123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL("/dashboard");
  });
});

test.describe("Landing Page", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("SwiftShopy").first()).toBeVisible();
  });

  test("should have get started link", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /get started/i }).first();
    await expect(link).toBeVisible();
  });
});
