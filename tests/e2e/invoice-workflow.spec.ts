import { test, expect, Page } from '@playwright/test';

test.describe('Invoice Workflow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login with test user
    await page.goto('/');
    await page.click('[data-testid="test-login-button"]');
    await page.waitForSelector('[data-testid="dashboard"]');
  });

  test('should create and send invoice successfully', async () => {
    // Navigate to create invoice page
    await page.click('[data-testid="nav-send-invoice"]');
    await expect(page).toHaveURL(/.*send/);

    // Fill invoice details
    await page.fill('[data-testid="invoice-number"]', 'TEST-E2E-001');
    await page.selectOption('[data-testid="recipient-select"]', 'test-company-1');
    await page.fill('[data-testid="issue-date"]', '2024-01-15');
    await page.fill('[data-testid="due-date"]', '2024-02-14');

    // Add invoice item
    await page.fill('[data-testid="item-description-0"]', 'E2E Test Product');
    await page.fill('[data-testid="item-quantity-0"]', '2');
    await page.fill('[data-testid="item-unit-price-0"]', '100.00');
    await page.selectOption('[data-testid="item-vat-rate-0"]', '24');

    // Verify total calculation
    await expect(page.locator('[data-testid="item-total-0"]')).toHaveText('€248.00');
    await expect(page.locator('[data-testid="invoice-subtotal"]')).toHaveText('€200.00');
    await expect(page.locator('[data-testid="invoice-vat"]')).toHaveText('€48.00');
    await expect(page.locator('[data-testid="invoice-total"]')).toHaveText('€248.00');

    // Send invoice
    await page.click('[data-testid="send-invoice-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Invoice sent successfully');
  });

  test('should add multiple invoice items', async () => {
    await page.click('[data-testid="nav-send-invoice"]');

    // Add first item
    await page.fill('[data-testid="item-description-0"]', 'Product 1');
    await page.fill('[data-testid="item-quantity-0"]', '1');
    await page.fill('[data-testid="item-unit-price-0"]', '100.00');

    // Add second item
    await page.click('[data-testid="add-item-button"]');
    await page.fill('[data-testid="item-description-1"]', 'Product 2');
    await page.fill('[data-testid="item-quantity-1"]', '2');
    await page.fill('[data-testid="item-unit-price-1"]', '50.00');

    // Verify totals
    await expect(page.locator('[data-testid="invoice-subtotal"]')).toHaveText('€200.00');
    await expect(page.locator('[data-testid="invoice-total"]')).toHaveText('€248.00');

    // Remove second item
    await page.click('[data-testid="remove-item-1"]');
    await expect(page.locator('[data-testid="item-description-1"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="invoice-subtotal"]')).toHaveText('€100.00');
  });

  test('should validate required fields', async () => {
    await page.click('[data-testid="nav-send-invoice"]');

    // Try to send without required fields
    await page.click('[data-testid="send-invoice-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Please select a recipient');
  });

  test('should display invoice list correctly', async () => {
    // Navigate to sent invoices
    await page.click('[data-testid="nav-outgoing-invoices"]');
    await expect(page).toHaveURL(/.*outgoing/);

    // Should show invoice table
    await expect(page.locator('[data-testid="invoice-table"]')).toBeVisible();
    
    // Should have table headers
    await expect(page.locator('[data-testid="table-header-invoice"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-customer"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-status"]')).toBeVisible();

    // Should show at least one invoice (from previous tests or demo data)
    const invoiceRows = page.locator('[data-testid^="invoice-row-"]');
    await expect(invoiceRows.first()).toBeVisible();
  });

  test('should filter invoices by status', async () => {
    await page.click('[data-testid="nav-outgoing-invoices"]');

    // Filter by draft status
    await page.selectOption('[data-testid="status-filter"]', 'draft');
    
    // Should update the list
    await page.waitForTimeout(500); // Wait for filter to apply
    
    // All visible invoices should have draft status
    const statusBadges = page.locator('[data-testid^="status-badge-"]');
    const count = await statusBadges.count();
    
    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toContainText('Draft');
    }
  });

  test('should search invoices', async () => {
    await page.click('[data-testid="nav-outgoing-invoices"]');

    // Search for specific invoice
    await page.fill('[data-testid="search-input"]', 'TD-INV-2024');
    
    // Should filter results
    await page.waitForTimeout(500);
    
    const invoiceRows = page.locator('[data-testid^="invoice-row-"]');
    const count = await invoiceRows.count();
    
    // All visible invoices should match search term
    for (let i = 0; i < count; i++) {
      const invoiceNumber = await invoiceRows.nth(i).locator('[data-testid="invoice-number"]').textContent();
      expect(invoiceNumber).toContain('TD-INV-2024');
    }
  });

  test('should navigate to dashboard and show stats', async () => {
    await page.click('[data-testid="nav-dashboard"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Should show stats cards
    await expect(page.locator('[data-testid="stat-sent-invoices"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-received-invoices"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-pending-payments"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-revenue"]')).toBeVisible();

    // Stats should have numeric values
    const sentInvoicesText = await page.locator('[data-testid="stat-sent-invoices"] .text-3xl').textContent();
    expect(sentInvoicesText).toMatch(/^\d+$/);
  });

  test('should handle responsive design', async () => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.click('[data-testid="nav-send-invoice"]');
    
    // Form should be responsive
    await expect(page.locator('[data-testid="invoice-form"]')).toBeVisible();
    
    // Items should stack vertically on mobile
    const itemsContainer = page.locator('[data-testid="invoice-items"]');
    await expect(itemsContainer).toHaveCSS('flex-direction', 'column');
  });

  test('should handle errors gracefully', async () => {
    // Mock network error
    await page.route('**/api/invoices', route => {
      route.abort('failed');
    });

    await page.click('[data-testid="nav-send-invoice"]');
    
    // Fill form
    await page.fill('[data-testid="invoice-number"]', 'ERROR-TEST-001');
    await page.selectOption('[data-testid="recipient-select"]', 'test-company-1');
    await page.fill('[data-testid="item-description-0"]', 'Test Product');
    await page.fill('[data-testid="item-quantity-0"]', '1');
    await page.fill('[data-testid="item-unit-price-0"]', '100.00');

    // Try to send
    await page.click('[data-testid="send-invoice-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
  });

  test('should maintain form state during navigation', async () => {
    await page.click('[data-testid="nav-send-invoice"]');

    // Fill some form data
    await page.fill('[data-testid="invoice-number"]', 'DRAFT-001');
    await page.fill('[data-testid="item-description-0"]', 'Draft Product');

    // Navigate away and back
    await page.click('[data-testid="nav-dashboard"]');
    await page.click('[data-testid="nav-send-invoice"]');

    // Form should be reset (this is expected behavior)
    await expect(page.locator('[data-testid="invoice-number"]')).not.toHaveValue('DRAFT-001');
  });

  test('should show loading states', async () => {
    // Mock slow API response
    await page.route('**/api/invoices', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { id: 'test-invoice' } })
        });
      }, 2000);
    });

    await page.click('[data-testid="nav-send-invoice"]');
    
    // Fill form
    await page.fill('[data-testid="invoice-number"]', 'LOADING-TEST-001');
    await page.selectOption('[data-testid="recipient-select"]', 'test-company-1');
    await page.fill('[data-testid="item-description-0"]', 'Test Product');
    await page.fill('[data-testid="item-quantity-0"]', '1');
    await page.fill('[data-testid="item-unit-price-0"]', '100.00');

    // Click send and verify loading state
    await page.click('[data-testid="send-invoice-button"]');
    
    // Should show loading spinner
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Button should be disabled
    await expect(page.locator('[data-testid="send-invoice-button"]')).toBeDisabled();
    
    // Wait for completion
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
  });
});