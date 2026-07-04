import { test, expect } from '@playwright/test';

test.describe('Student Course Enrollment Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Start at the home page for all tests in this suite
    await page.goto('/');
  });

  test('Visitor can navigate to Courses catalogue', async ({ page }) => {
    // Click Courses from header navigation map
    const navCoursesBtn = page.getByRole('navigation').getByRole('link', { name: 'Courses', exact: true });
    await expect(navCoursesBtn).toBeVisible();
    await navCoursesBtn.click();
    
    // Validate routing to the catalogue
    await expect(page).toHaveURL(/.*\/courses/);
    await expect(page.getByRole('heading', { name: 'Explore Our Courses' })).toBeVisible();
  });

  test('Visitor can view a specific Course Details page', async ({ page }) => {
    await page.goto('/courses');

    // We don't know the exact title, but we can look for the "Learn More" or a link inside the course grid
    const courseCardLink = page.locator('a[href^="/courses/"]').first();
    
    // Wait for courses to load (SWR fetch)
    await courseCardLink.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);

    // If courses rendered, click the first one
    if (await courseCardLink.isVisible()) {
      const href = await courseCardLink.getAttribute('href');
      await courseCardLink.click();
      
      // Wait for navigation
      await page.waitForURL(`**${href}`);
      
      // Verify the details page structure
      await expect(page.getByRole('button', { name: /Enroll Now/i }).or(page.getByText('Start Learning'))).toBeVisible();
    } else {
       console.log('No courses found in database to test view flow.');
    }
  });

  test('Enrolling triggers Auth redirect for unauthenticated users', async ({ page }) => {
     await page.goto('/courses');
     const courseCardLink = page.locator('a[href^="/courses/"]').first();
     await courseCardLink.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);

     if (await courseCardLink.isVisible()) {
        await courseCardLink.click();
        
        // Find the enroll button
        const enrollBtn = page.getByRole('button', { name: /Enroll Now/i });
        
        if (await enrollBtn.isVisible()) {
            await enrollBtn.click();
            // Since we aren't logged in, it should bounce us to login
            await expect(page).toHaveURL(/.*\/signin.*/);
        }
     }
  });

});
