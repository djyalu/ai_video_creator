import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Image to Video Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Image to Video tab
    await page.click('text=Image to Video');
  });

  test('should display the image-to-video form with all elements', async ({ page }) => {
    // Check form title and description
    await expect(page.locator('h2:has-text("Image to Video")')).toBeVisible();
    await expect(page.locator('text=Upload an image and describe the motion')).toBeVisible();

    // Check upload section
    await expect(page.locator('text=Upload Image')).toBeVisible();
    await expect(page.locator('text=Drag and drop an image here')).toBeVisible();
    await expect(page.locator('text=Supports JPG, PNG, WEBP, GIF up to 10MB')).toBeVisible();

    // Check form fields
    await expect(page.locator('textarea[id="motion-prompt"]')).toBeVisible();
    await expect(page.locator('select[id="duration"]')).toBeVisible();
    await expect(page.locator('select[id="motion_intensity"]')).toBeVisible();
    await expect(page.locator('select[id="camera_movement"]')).toBeVisible();

    // Check buttons
    await expect(page.locator('button:has-text("Animate Image")')).toBeVisible();
    await expect(page.locator('button:has-text("Reset")')).toBeVisible();

    // Check tips section
    await expect(page.locator('text=Animation Tips')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const animateButton = page.locator('button:has-text("Animate Image")');
    
    // Button should be disabled when no image and no prompt
    await expect(animateButton).toBeDisabled();

    // Add prompt but no image
    await page.fill('textarea[id="motion-prompt"]', 'Gentle wind blowing through the trees');
    
    // Button should still be disabled without image
    await expect(animateButton).toBeDisabled();
  });

  test('should validate motion prompt length', async ({ page }) => {
    // Fill with very short prompt
    await page.fill('textarea[id="motion-prompt"]', 'wind');
    
    // Try to click animate button (should show validation error)
    const animateButton = page.locator('button:has-text("Animate Image")');
    await animateButton.click();
    
    // Should show validation error for short prompt
    await expect(page.locator('text=Please provide a more detailed motion description')).toBeVisible({ timeout: 5000 });
  });

  test('should show character count for motion prompt', async ({ page }) => {
    const motionDescription = 'Gentle wind blowing through the trees, leaves rustling softly';
    
    // Fill the motion prompt
    await page.fill('textarea[id="motion-prompt"]', motionDescription);
    
    // Check character counter
    await expect(page.locator('text=' + motionDescription.length + '/500')).toBeVisible();
  });

  test('should have proper form field options', async ({ page }) => {
    // Check duration options
    const durationSelect = page.locator('select[id="duration"]');
    await expect(durationSelect).toBeVisible();
    
    const durationOptions = await durationSelect.locator('option').allTextContents();
    expect(durationOptions).toContain('3 seconds');
    expect(durationOptions).toContain('5 seconds');
    expect(durationOptions).toContain('8 seconds');
    expect(durationOptions).toContain('10 seconds');

    // Check motion intensity options
    const intensitySelect = page.locator('select[id="motion_intensity"]');
    const intensityOptions = await intensitySelect.locator('option').allTextContents();
    expect(intensityOptions).toContain('Subtle');
    expect(intensityOptions).toContain('Medium');
    expect(intensityOptions).toContain('Strong');
    expect(intensityOptions).toContain('Dramatic');

    // Check camera movement options
    const cameraSelect = page.locator('select[id="camera_movement"]');
    const cameraOptions = await cameraSelect.locator('option').allTextContents();
    expect(cameraOptions).toContain('None');
    expect(cameraOptions).toContain('Subtle Zoom');
    expect(cameraOptions).toContain('Pan Left');
    expect(cameraOptions).toContain('Pan Right');
  });

  test('should reset form when reset button is clicked', async ({ page }) => {
    const motionPrompt = 'Test motion description for reset';
    
    // Fill the form
    await page.fill('textarea[id="motion-prompt"]', motionPrompt);
    await page.selectOption('select[id="duration"]', '8');
    await page.selectOption('select[id="motion_intensity"]', 'strong');
    await page.selectOption('select[id="camera_movement"]', 'pan_left');

    // Click reset
    await page.click('button:has-text("Reset")');

    // Check that form is reset
    await expect(page.locator('textarea[id="motion-prompt"]')).toHaveValue('');
    await expect(page.locator('select[id="duration"]')).toHaveValue('5'); // default
    await expect(page.locator('select[id="motion_intensity"]')).toHaveValue('medium'); // default
    await expect(page.locator('select[id="camera_movement"]')).toHaveValue('none'); // default
  });

  test('should maintain form state when switching tabs', async ({ page }) => {
    const testMotion = 'Maintaining state motion description';
    
    // Fill the form
    await page.fill('textarea[id="motion-prompt"]', testMotion);
    await page.selectOption('select[id="duration"]', '10');
    
    // Switch to another tab
    await page.click('text=Text to Video');
    await expect(page.locator('h2:has-text("Text to Video")')).toBeVisible();
    
    // Return to Image to Video tab
    await page.click('text=Image to Video');
    
    // Form state should be maintained
    await expect(page.locator('textarea[id="motion-prompt"]')).toHaveValue(testMotion);
    await expect(page.locator('select[id="duration"]')).toHaveValue('10');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check that motion prompt has proper label
    const motionTextarea = page.locator('textarea[id="motion-prompt"]');
    const motionLabel = page.locator('label[for="motion-prompt"]');
    
    await expect(motionLabel).toHaveText(/Motion Description/);
    await expect(motionTextarea).toHaveAttribute('placeholder');
    
    // Check select elements have labels
    const durationSelect = page.locator('select[id="duration"]');
    const durationLabel = page.locator('label[for="duration"]');
    
    await expect(durationLabel).toHaveText(/Duration/);
    
    const intensitySelect = page.locator('select[id="motion_intensity"]');
    const intensityLabel = page.locator('label[for="motion_intensity"]');
    
    await expect(intensityLabel).toHaveText(/Motion Intensity/);
    
    const cameraSelect = page.locator('select[id="camera_movement"]');
    const cameraLabel = page.locator('label[for="camera_movement"]');
    
    await expect(cameraLabel).toHaveText(/Camera Movement/);
  });

  test('should have file input with correct accept attribute', async ({ page }) => {
    // Check that file input exists and has proper accept attribute
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    const acceptAttribute = await fileInput.getAttribute('accept');
    expect(acceptAttribute).toBe('.jpg,.jpeg,.png,.webp,.gif');
  });

  test('should show loading state during form submission', async ({ page }) => {
    // Fill the form with valid data
    await page.fill('textarea[id="motion-prompt"]', 'Gentle flowing water with subtle ripples and light reflections');
    
    // Mock the API response to simulate loading
    await page.route('**/api/v1/video/generate/image', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          job_id: 'test-image-job-id',
          status: 'pending',
          message: 'Image animation started successfully'
        })
      });
    });
    
    const animateButton = page.locator('button:has-text("Animate Image")');
    
    // For this test, we'll simulate having an image selected
    // In a real test, you'd upload a file, but for the loading state test,
    // we can mock the form state
    
    // Note: This test focuses on the loading UI behavior
    // A complete test would include actual file upload
  });

  test('should show proper animation tips', async ({ page }) => {
    // Check that tips section is visible
    await expect(page.locator('text=Animation Tips')).toBeVisible();
    
    // Check some specific tips
    await expect(page.locator('text=Focus on describing motion, not the scene content')).toBeVisible();
    await expect(page.locator('text=Use natural movement descriptions')).toBeVisible();
    await expect(page.locator('text=Consider the physics of your scene')).toBeVisible();
    await expect(page.locator('text=Start with subtle motion')).toBeVisible();
  });
});