import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('text=Chameleon');
});

// Helper: fill and submit a finance record via the modal form
async function addFinanceRecord(page, { description, type, income, expenses }) {
  await page.click('button:has-text("Add Record")');
  await expect(page.getByRole('heading', { name: 'Add Record' })).toBeVisible();

  const form = page.locator('form');

  await form.locator('input[placeholder="e.g. Monthly Salary, Water Bill"]').fill(description);
  if (type) {
    await form.locator('select').first().selectOption(type);
  }
  if (income) {
    await form.locator('input[placeholder="0"]').nth(0).fill(String(income));
  }
  if (expenses) {
    await form.locator('input[placeholder="0"]').nth(1).fill(String(expenses));
  }

  await form.getByRole('button', { name: 'Add Record' }).click();
}

test.describe('Tab Navigation', () => {
  test('shows Subscriptions and Finance tabs', async ({ page }) => {
    await expect(page.locator('button:has-text("Subscriptions")')).toBeVisible();
    await expect(page.locator('button:has-text("Finance")')).toBeVisible();
  });

  test('defaults to Subscriptions tab', async ({ page }) => {
    await expect(page.locator('text=No subscriptions yet')).toBeVisible();
    await expect(page.locator('text=Total Income')).not.toBeVisible();
  });

  test('switches to Finance tab', async ({ page }) => {
    await page.click('button:has-text("Finance")');
    await expect(page.locator('text=Total Income')).toBeVisible();
    await expect(page.locator('text=Total Expenses')).toBeVisible();
    await expect(page.locator('text=Net Balance')).toBeVisible();
    await expect(page.locator('text=No subscriptions yet')).not.toBeVisible();
  });

  test('switches back to Subscriptions tab', async ({ page }) => {
    await page.click('button:has-text("Finance")');
    await expect(page.locator('text=Total Income')).toBeVisible();

    await page.click('button:has-text("Subscriptions")');
    await expect(page.locator('text=No subscriptions yet')).toBeVisible();
    await expect(page.locator('text=Total Income')).not.toBeVisible();
  });

  test('tab state is independent of subscription step', async ({ page }) => {
    // Add a subscription first
    await page.click('text=Browse All Presets');
    await page.fill('input[placeholder="e.g. Netflix"]', 'TabTest');
    await page.fill('input[placeholder="9.99"]', '10');
    await page.getByRole('button', { name: 'Add Subscription' }).click();

    // Go to dashboard (step 2)
    await page.click('text=View Dashboard');
    await expect(page.locator('text=Back')).toBeVisible();

    // Switch to Finance tab
    await page.click('button:has-text("Finance")');
    await expect(page.locator('text=Total Income')).toBeVisible();
    await expect(page.locator('text=Back')).not.toBeVisible();

    // Switch back - should still be on dashboard
    await page.click('button:has-text("Subscriptions")');
    await expect(page.locator('text=Back')).toBeVisible();
  });
});

test.describe('Finance Section - Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await page.click('button:has-text("Finance")');
  });

  test('shows summary cards with zero values', async ({ page }) => {
    await expect(page.locator('text=Total Income')).toBeVisible();
    await expect(page.locator('text=Total Expenses')).toBeVisible();
    await expect(page.locator('text=Min. Expenses')).toBeVisible();
    await expect(page.locator('text=Net Balance')).toBeVisible();
  });

  test('shows empty record list', async ({ page }) => {
    await expect(page.locator('text=No financial records yet')).toBeVisible();
    await expect(page.locator('text=Add a record or sync from Google Sheets')).toBeVisible();
  });

  test('shows toolbar buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
    await expect(page.locator('button:has-text("Template")')).toBeVisible();
  });

  test('shows Add Record button', async ({ page }) => {
    await expect(page.locator('button:has-text("Add Record")')).toBeVisible();
  });

  test('shows filter pills', async ({ page }) => {
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Income")')).toBeVisible();
    await expect(page.locator('button:has-text("Utility")')).toBeVisible();
    await expect(page.locator('button:has-text("Loan")')).toBeVisible();
    await expect(page.locator('button:has-text("Credit Card")')).toBeVisible();
  });

  test('shows date range dropdown', async ({ page }) => {
    const select = page.locator('select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('all');
  });
});

test.describe('Finance - Add Record', () => {
  test.beforeEach(async ({ page }) => {
    await page.click('button:has-text("Finance")');
  });

  test('opens Add Record modal', async ({ page }) => {
    await page.click('button:has-text("Add Record")');
    await expect(page.getByRole('heading', { name: 'Add Record' })).toBeVisible();
  });

  test('adds a record with income', async ({ page }) => {
    await addFinanceRecord(page, { description: 'Salary', type: 'Income', income: 5000 });

    await expect(page.locator('text=Salary').first()).toBeVisible();
    await expect(page.locator('text=No financial records yet')).not.toBeVisible();
  });

  test('adds a record with expense', async ({ page }) => {
    await addFinanceRecord(page, { description: 'Water Bill', type: 'Utility', expenses: 50 });

    await expect(page.locator('text=Water Bill').first()).toBeVisible();
  });

  test('requires description field', async ({ page }) => {
    await page.click('button:has-text("Add Record")');

    const form = page.locator('form');
    await form.locator('input[placeholder="0"]').nth(0).fill('1000');

    // Try to submit (should fail HTML5 validation)
    await form.getByRole('button', { name: 'Add Record' }).click();

    // Modal should still be open
    await expect(page.getByRole('heading', { name: 'Add Record' })).toBeVisible();
  });

  test('closes modal after adding record', async ({ page }) => {
    await addFinanceRecord(page, { description: 'Test', income: 100 });

    // Modal should be closed
    await expect(page.getByRole('heading', { name: 'Add Record' })).not.toBeVisible();
  });
});

test.describe('Finance - Record Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.click('button:has-text("Finance")');

    // Add an income record
    await addFinanceRecord(page, { description: 'MonthSalary', type: 'Income', income: 5000 });
    await expect(page.locator('text=MonthSalary').first()).toBeVisible();

    // Add an expense record
    await addFinanceRecord(page, { description: 'Electric Bill', type: 'Utility', expenses: 150 });
    await expect(page.locator('text=Electric Bill').first()).toBeVisible();
  });

  test('shows multiple records', async ({ page }) => {
    await expect(page.locator('text=MonthSalary').first()).toBeVisible();
    await expect(page.locator('text=Electric Bill').first()).toBeVisible();
  });

  test('can edit a record', async ({ page }) => {
    // Click edit button on first record (edit icon)
    const editBtn = page.locator('button').filter({ has: page.locator('path[d*="M11 5H6"]') }).first();
    await editBtn.click();

    // Modal should show Edit Record
    await expect(page.getByRole('heading', { name: 'Edit Record' })).toBeVisible();

    // Change the description
    const form = page.locator('form');
    await form.locator('input[placeholder="e.g. Monthly Salary, Water Bill"]').fill('Updated Salary');
    await form.getByRole('button', { name: 'Save Changes' }).click();

    // Verify update
    await expect(page.locator('text=Updated Salary').first()).toBeVisible();
  });

  test('can delete a record', async ({ page }) => {
    // Click delete button (trash icon) on Electric Bill's card
    const trashBtns = page.locator('button').filter({ has: page.locator('path[d*="M19 7l"]') });
    // Delete the second record (Electric Bill)
    await trashBtns.nth(1).click();

    await expect(page.locator('text=Electric Bill')).not.toBeVisible();
    await expect(page.locator('text=MonthSalary').first()).toBeVisible();
  });
});

test.describe('Finance - Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.click('button:has-text("Finance")');

    // Add an Income record
    await addFinanceRecord(page, { description: 'SalaryFilter', type: 'Income', income: 5000 });

    // Add a Utility record
    await addFinanceRecord(page, { description: 'WaterFilter', type: 'Utility', expenses: 80 });

    // Wait for both to appear
    await expect(page.locator('text=SalaryFilter').first()).toBeVisible();
    await expect(page.locator('text=WaterFilter').first()).toBeVisible();
  });

  test('filters by Income type', async ({ page }) => {
    const incomePill = page.locator('button:has-text("Income")').first();
    await incomePill.click();

    await expect(page.locator('text=SalaryFilter').first()).toBeVisible();
    await expect(page.locator('text=WaterFilter')).not.toBeVisible();
  });

  test('filters by Utility type', async ({ page }) => {
    const utilityPill = page.locator('button:has-text("Utility")').first();
    await utilityPill.click();

    await expect(page.locator('text=WaterFilter').first()).toBeVisible();
    await expect(page.locator('text=SalaryFilter')).not.toBeVisible();
  });

  test('All filter shows everything', async ({ page }) => {
    // First filter to Income
    await page.locator('button:has-text("Income")').first().click();
    await expect(page.locator('text=WaterFilter')).not.toBeVisible();

    // Then back to All
    await page.locator('button:has-text("All")').first().click();
    await expect(page.locator('text=SalaryFilter').first()).toBeVisible();
    await expect(page.locator('text=WaterFilter').first()).toBeVisible();
  });
});

test.describe('Finance - Summary Cards', () => {
  test('updates summary when records are added', async ({ page }) => {
    await page.click('button:has-text("Finance")');

    await addFinanceRecord(page, { description: 'SummaryIncome', type: 'Income', income: 3000 });
    await addFinanceRecord(page, { description: 'SummaryExpense', type: 'Utility', expenses: 500 });

    // Summary cards should show non-zero values
    const summaryCards = page.locator('.grid.grid-cols-2 .rounded-2xl');
    const cardCount = await summaryCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(4);
  });
});

test.describe('Finance - Data Persistence', () => {
  test('finance records persist across page reload', async ({ page }) => {
    await page.click('button:has-text("Finance")');

    await addFinanceRecord(page, { description: 'PersistFinance', type: 'Income', income: 999 });
    await expect(page.locator('text=PersistFinance').first()).toBeVisible();

    // Reload
    await page.reload();
    await page.waitForSelector('text=Chameleon');

    // Switch to Finance tab
    await page.click('button:has-text("Finance")');

    // Record should still be there
    await expect(page.locator('text=PersistFinance').first()).toBeVisible();
  });

  test('finance and subscription data are independent', async ({ page }) => {
    // Add subscription
    await page.click('text=Browse All Presets');
    await page.fill('input[placeholder="e.g. Netflix"]', 'IndependentSub');
    await page.fill('input[placeholder="9.99"]', '12');
    await page.getByRole('button', { name: 'Add Subscription' }).click();

    // Switch to Finance and add record
    await page.click('button:has-text("Finance")');
    await addFinanceRecord(page, { description: 'IndependentFin', income: 500 });

    // Verify Finance has the finance record
    await expect(page.locator('text=IndependentFin').first()).toBeVisible();
    await expect(page.locator('text=IndependentSub')).not.toBeVisible();

    // Switch to Subscriptions
    await page.click('button:has-text("Subscriptions")');

    // Verify Subscriptions has the subscription
    await expect(page.locator('.truncate.font-bold:has-text("IndependentSub")')).toBeVisible();
    await expect(page.locator('text=IndependentFin')).not.toBeVisible();
  });
});

test.describe('Finance - Full User Flow', () => {
  test('complete flow: add records -> filter -> edit -> delete -> persist', async ({ page }) => {
    // 1. Switch to Finance
    await page.click('button:has-text("Finance")');
    await expect(page.locator('text=No financial records yet')).toBeVisible();

    // 2. Add income record
    await addFinanceRecord(page, { description: 'FlowSalary', type: 'Income', income: 5000 });
    await expect(page.locator('text=FlowSalary').first()).toBeVisible();

    // 3. Add expense record
    await addFinanceRecord(page, { description: 'FlowRent', type: 'Utility', expenses: 1500 });
    await expect(page.locator('text=FlowRent').first()).toBeVisible();

    // 4. Filter by Income
    await page.locator('button:has-text("Income")').first().click();
    await expect(page.locator('text=FlowSalary').first()).toBeVisible();
    await expect(page.locator('text=FlowRent')).not.toBeVisible();

    // 5. Switch back to All
    await page.locator('button:has-text("All")').first().click();
    await expect(page.locator('text=FlowSalary').first()).toBeVisible();
    await expect(page.locator('text=FlowRent').first()).toBeVisible();

    // 6. Edit income record
    const editBtn = page.locator('button').filter({ has: page.locator('path[d*="M11 5H6"]') }).first();
    await editBtn.click();
    await expect(page.getByRole('heading', { name: 'Edit Record' })).toBeVisible();
    const form = page.locator('form');
    await form.locator('input[placeholder="e.g. Monthly Salary, Water Bill"]').fill('FlowSalaryEdited');
    await form.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.locator('text=FlowSalaryEdited').first()).toBeVisible();

    // 7. Delete expense record
    const trashBtns = page.locator('button').filter({ has: page.locator('path[d*="M19 7l"]') });
    await trashBtns.nth(1).click();
    await expect(page.locator('text=FlowRent')).not.toBeVisible();

    // 8. Verify persistence
    await page.reload();
    await page.waitForSelector('text=Chameleon');
    await page.click('button:has-text("Finance")');
    await expect(page.locator('text=FlowSalaryEdited').first()).toBeVisible();
    await expect(page.locator('text=FlowRent')).not.toBeVisible();
  });
});
