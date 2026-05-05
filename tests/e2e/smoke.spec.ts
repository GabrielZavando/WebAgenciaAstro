import { test, expect } from '@playwright/test';

test.describe('Smoke Tests @smoke', () => {
  test('debe cargar la página de inicio', async ({ page }) => {
    await page.goto('/');
    // Ajustar el selector según lo que realmente hay en la home
    await expect(page).toHaveTitle(/Agencia Digital/);
  });

  test('debe cargar la página de metodología', async ({ page }) => {
    await page.goto('/metodologia');
    // Ajustar el selector según el contenido real
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });
});
