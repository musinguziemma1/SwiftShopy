import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome Back")).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
  });

  test("should show signup page", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create Account")).toBeVisible();
    await expect(page.getByPlaceholder("Full Name")).toBeVisible();
  });

  test("should login with demo seller", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("seller@swiftshopy.com");
    await page.getByPlaceholder("Password").fill("seller123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL("/dashboard");
  });
});

test.describe("Landing Page", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("SwiftShopy")).toBeVisible();
  });

  test("should have login link", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.getByRole("link", { name: /login/i });
    await expect(loginLink).toBeVisible();
  });
});
