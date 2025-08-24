import { test, expect } from '@playwright/test';

test.describe('AI Video Creator App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page successfully', async ({ page }) => {
    // Check if the main header is visible
    await expect(page.locator('h1:has-text("AI Video Creator")')).toBeVisible();
    
    // Check if the navigation tabs are present
    await expect(page.locator('text=Text to Video')).toBeVisible();
    await expect(page.locator('text=Image to Video')).toBeVisible();
    await expect(page.locator('text=Job Status')).toBeVisible();
    
    // Check if the default tab (Text to Video) content is visible
    await expect(page.locator('h2:has-text("Text to Video")')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Describe the video"]')).toBeVisible();
  });

  test('should show health status banner', async ({ page }) => {
    // Wait for health check to complete and check for status banner
    await page.waitForTimeout(2000);
    
    const healthBanner = page.locator('[class*="bg-success-500"], [class*="bg-error-500"]');
    await expect(healthBanner).toBeVisible({ timeout: 5000 });
  });

  test('should navigate between tabs correctly', async ({ page }) => {
    // Start on Text to Video tab
    await expect(page.locator('h2:has-text("Text to Video")')).toBeVisible();
    
    // Click Image to Video tab
    await page.click('text=Image to Video');
    await expect(page.locator('h2:has-text("Image to Video")')).toBeVisible();
    await expect(page.locator('text=Upload Image')).toBeVisible();
    
    // Click Job Status tab
    await page.click('text=Job Status');
    await expect(page.locator('h2:has-text("Video Generation Jobs")')).toBeVisible();
    
    // Go back to Text to Video
    await page.click('text=Text to Video');
    await expect(page.locator('h2:has-text("Text to Video")')).toBeVisible();
  });

  test('should have accessible navigation and forms', async ({ page }) => {
    // Check that form elements have proper labels
    const promptTextarea = page.locator('textarea[id="prompt"]');
    await expect(promptTextarea).toBeVisible();
    
    const promptLabel = page.locator('label[for="prompt"]');
    await expect(promptLabel).toBeVisible();
    
    // Check select elements have labels
    const durationSelect = page.locator('select[id="duration"]');
    await expect(durationSelect).toBeVisible();
    
    const durationLabel = page.locator('label[for="duration"]');
    await expect(durationLabel).toBeVisible();
  });

  test('should show footer with correct links', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Check footer content
    await expect(page.locator('text=© 2024 AI Video Creator')).toBeVisible();
    
    // Check external links
    const docLink = page.locator('a[href*="djyalu.github.io"]');
    await expect(docLink).toBeVisible();
    
    const apiLink = page.locator('a[href*="onrender.com/docs"]');
    await expect(apiLink).toBeVisible();
    
    const githubLink = page.locator('a[href*="github.com"]');
    await expect(githubLink).toBeVisible();
  });
});