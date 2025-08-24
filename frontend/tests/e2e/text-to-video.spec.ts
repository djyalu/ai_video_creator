import { test, expect } from '@playwright/test';

test.describe('Text to Video Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure we're on the Text to Video tab
    await page.click('text=Text to Video');
  });

  test('should display the text-to-video form with all elements', async ({ page }) => {
    // Check form title and description
    await expect(page.locator('h2:has-text("Text to Video")')).toBeVisible();
    await expect(page.locator('text=Describe your vision and let AI create')).toBeVisible();

    // Check form fields
    await expect(page.locator('textarea[id="prompt"]')).toBeVisible();
    await expect(page.locator('select[id="duration"]')).toBeVisible();
    await expect(page.locator('select[id="aspect_ratio"]')).toBeVisible();
    await expect(page.locator('select[id="style"]')).toBeVisible();
    await expect(page.locator('select[id="quality"]')).toBeVisible();

    // Check buttons
    await expect(page.locator('button:has-text("Generate Video")')).toBeVisible();
    await expect(page.locator('button:has-text("Reset")')).toBeVisible();

    // Check tips section
    await expect(page.locator('text=Pro Tips')).toBeVisible();
  });

  test('should validate required prompt field', async ({ page }) => {
    // Try to submit without prompt
    const generateButton = page.locator('button:has-text("Generate Video")');
    
    // Button should be disabled when prompt is empty
    await expect(generateButton).toBeDisabled();

    // Fill in a short prompt (less than 10 characters)
    await page.fill('textarea[id="prompt"]', 'short');
    
    // Click generate button
    await generateButton.click();
    
    // Should show validation error
    await expect(page.locator('text=Please provide a more detailed prompt')).toBeVisible({ timeout: 5000 });
  });

  test('should fill form with valid data and enable submit button', async ({ page }) => {
    const prompt = 'A beautiful sunset over the ocean with gentle waves and seabirds flying in the distance, cinematic lighting, peaceful atmosphere';
    
    // Fill the form
    await page.fill('textarea[id="prompt"]', prompt);
    await page.selectOption('select[id="duration"]', '8');
    await page.selectOption('select[id="aspect_ratio"]', '16:9');
    await page.selectOption('select[id="style"]', 'cinematic');
    await page.selectOption('select[id="quality"]', 'high');

    // Check that character count updates
    await expect(page.locator('text=' + prompt.length + '/1000')).toBeVisible();

    // Generate button should be enabled
    const generateButton = page.locator('button:has-text("Generate Video")');
    await expect(generateButton).toBeEnabled();
  });

  test('should reset form when reset button is clicked', async ({ page }) => {
    const prompt = 'Test prompt for reset functionality';
    
    // Fill the form
    await page.fill('textarea[id="prompt"]', prompt);
    await page.selectOption('select[id="duration"]', '10');
    await page.selectOption('select[id="style"]', 'anime');

    // Click reset
    await page.click('button:has-text("Reset")');

    // Check that form is reset
    await expect(page.locator('textarea[id="prompt"]')).toHaveValue('');
    await expect(page.locator('select[id="duration"]')).toHaveValue('5'); // default
    await expect(page.locator('select[id="style"]')).toHaveValue('realistic'); // default
  });

  test('should show character count and enforce limits', async ({ page }) => {
    const longPrompt = 'A'.repeat(1005); // Longer than 1000 character limit
    
    // Try to enter text longer than limit
    await page.fill('textarea[id="prompt"]', longPrompt);
    
    // Should be truncated to 1000 characters
    const promptValue = await page.locator('textarea[id="prompt"]').inputValue();
    expect(promptValue.length).toBeLessThanOrEqual(1000);
    
    // Character counter should show current count
    const counterText = await page.locator('text=/\\d+\\/1000/').textContent();
    expect(counterText).toMatch(/\d+\/1000/);
  });

  test('should maintain form state when switching tabs and returning', async ({ page }) => {
    const testPrompt = 'Maintaining state test prompt';
    
    // Fill the form
    await page.fill('textarea[id="prompt"]', testPrompt);
    await page.selectOption('select[id="duration"]', '8');
    
    // Switch to another tab
    await page.click('text=Image to Video');
    await expect(page.locator('h2:has-text("Image to Video")')).toBeVisible();
    
    // Return to Text to Video tab
    await page.click('text=Text to Video');
    
    // Form state should be maintained
    await expect(page.locator('textarea[id="prompt"]')).toHaveValue(testPrompt);
    await expect(page.locator('select[id="duration"]')).toHaveValue('8');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check that form has proper labels
    const promptTextarea = page.locator('textarea[id="prompt"]');
    const promptLabel = page.locator('label[for="prompt"]');
    
    await expect(promptLabel).toHaveText(/Video Prompt/);
    await expect(promptTextarea).toHaveAttribute('placeholder');
    
    // Check select elements have labels
    const durationSelect = page.locator('select[id="duration"]');
    const durationLabel = page.locator('label[for="duration"]');
    
    await expect(durationLabel).toHaveText(/Duration/);
    
    // Check that buttons have accessible text
    const generateButton = page.locator('button:has-text("Generate Video")');
    await expect(generateButton).toBeVisible();
    
    const resetButton = page.locator('button:has-text("Reset")');
    await expect(resetButton).toBeVisible();
  });

  test('should show loading state during form submission', async ({ page }) => {
    const prompt = 'Test prompt for loading state - a serene mountain landscape with flowing rivers';
    
    // Fill the form
    await page.fill('textarea[id="prompt"]', prompt);
    
    // Mock a slow response to see loading state
    await page.route('**/api/v1/video/generate/text', async route => {
      // Delay the response to see loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          job_id: 'test-job-id-12345',
          status: 'pending',
          message: 'Video generation started successfully'
        })
      });
    });
    
    const generateButton = page.locator('button:has-text("Generate Video")');
    
    // Click generate
    await generateButton.click();
    
    // Should show loading state
    await expect(page.locator('button:has-text("Generating Video")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.animate-spin')).toBeVisible();
    
    // Button should be disabled during loading
    await expect(generateButton).toBeDisabled();
  });
});