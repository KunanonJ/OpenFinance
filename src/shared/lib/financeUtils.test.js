import { filterRecords, computeSummary, exportFinanceCSV, parseFinanceCSVRow, isValidRecord } from '@shared/lib/financeUtils';

describe('Finance Utils', () => {
  const sampleRecords = [
    { id: '1', date: '2026-01-15', description: 'Salary', income: 5000, expenses: 0, minimumExpenses: 0, type: 'Income' },
    { id: '2', date: '2026-01-20', description: 'Water Bill', income: 0, expenses: 80, minimumExpenses: 80, type: 'Utility' },
    { id: '3', date: '2026-01-25', description: 'Car Loan', income: 0, expenses: 500, minimumExpenses: 200, type: 'Loan', interestRate: 5.5 },
    { id: '4', date: '2026-02-15', description: 'Salary Feb', income: 5000, expenses: 0, minimumExpenses: 0, type: 'Income' },
    { id: '5', date: '2025-01-15', description: 'Old Salary', income: 4500, expenses: 0, minimumExpenses: 0, type: 'Income' },
  ];

  // --- computeSummary ---

  test('FU-1: computeSummary with empty records returns all zeros', () => {
    const result = computeSummary([], { type: 'all', dateRange: 'all' });
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.totalMinimumExpenses).toBe(0);
    expect(result.netBalance).toBe(0);
    expect(result.recordCount).toBe(0);
  });

  test('FU-2: computeSummary correctly sums income values', () => {
    const result = computeSummary(sampleRecords, { type: 'all', dateRange: 'all' });
    expect(result.totalIncome).toBe(14500);
  });

  test('FU-3: computeSummary correctly sums expenses values', () => {
    const result = computeSummary(sampleRecords, { type: 'all', dateRange: 'all' });
    expect(result.totalExpenses).toBe(580);
  });

  test('FU-4: computeSummary correctly sums minimumExpenses', () => {
    const result = computeSummary(sampleRecords, { type: 'all', dateRange: 'all' });
    expect(result.totalMinimumExpenses).toBe(280);
  });

  test('FU-5: computeSummary returns correct net balance', () => {
    const result = computeSummary(sampleRecords, { type: 'all', dateRange: 'all' });
    expect(result.netBalance).toBe(14500 - 580);
  });

  test('FU-6: computeSummary with type filter only includes matching records', () => {
    const result = computeSummary(sampleRecords, { type: 'Income', dateRange: 'all' });
    expect(result.totalIncome).toBe(14500);
    expect(result.totalExpenses).toBe(0);
    expect(result.recordCount).toBe(3);
  });

  // --- filterRecords ---

  test('FU-7: filterRecords with type Income returns only income records', () => {
    const result = filterRecords(sampleRecords, { type: 'Income', dateRange: 'all' });
    expect(result).toHaveLength(3);
    expect(result.every((r) => r.type === 'Income')).toBe(true);
  });

  test('FU-8: filterRecords with type all returns all records', () => {
    const result = filterRecords(sampleRecords, { type: 'all', dateRange: 'all' });
    expect(result).toHaveLength(5);
  });

  test('FU-9: filterRecords with dateRange thisYear returns current year records', () => {
    const result = filterRecords(sampleRecords, { type: 'all', dateRange: 'thisYear' });
    const thisYear = new Date().getFullYear();
    expect(result.every((r) => new Date(r.date).getFullYear() === thisYear)).toBe(true);
  });

  test('FU-10: filterRecords with invalid dates are excluded', () => {
    const records = [
      { id: '1', date: '', description: 'No date', income: 100, type: 'Income' },
      { id: '2', date: '2026-01-15', description: 'Valid', income: 200, type: 'Income' },
    ];
    const result = filterRecords(records, { type: 'all', dateRange: 'thisYear' });
    expect(result).toHaveLength(1);
  });

  // --- exportFinanceCSV ---

  test('FU-11: exportFinanceCSV generates correct header row', () => {
    const csv = exportFinanceCSV([]);
    expect(csv.startsWith('Date,Description,Interested Rate,Income,Expenses,Minimum Expenses,Balance,Due Date,Payment Method,How I paid?,Done?,Type,Note')).toBe(true);
  });

  test('FU-12: exportFinanceCSV correctly quotes fields with commas', () => {
    const records = [{ date: '2026-01-01', description: 'Rent, Utilities', type: 'Utility', income: 0, expenses: 100, done: false }];
    const csv = exportFinanceCSV(records);
    expect(csv).toContain('"Rent, Utilities"');
  });

  test('FU-13: exportFinanceCSV includes all template columns', () => {
    const records = [{
      date: '2026-01-01', description: 'Test', interestRate: 5, income: 1000, expenses: 500,
      minimumExpenses: 200, balance: 5000, dueDate: '2026-02-01', paymentMethod: 'Cash',
      howPaid: 'Direct', done: true, type: 'Loan', note: 'Test note',
    }];
    const csv = exportFinanceCSV(records);
    const lines = csv.trim().split('\n');
    expect(lines).toHaveLength(2);
    // Check all fields are present in the data row
    expect(lines[1]).toContain('"Test"');
    expect(lines[1]).toContain('"TRUE"');
    expect(lines[1]).toContain('"Test note"');
  });

  // --- parseFinanceCSVRow ---

  test('FU-14: parseFinanceCSVRow correctly maps column indices', () => {
    const row = ['2026-01-15', 'Salary', '0', '5000', '0', '0', '50000', '', 'Direct Deposit', 'Bank', 'TRUE', 'Income', 'Monthly'];
    const record = parseFinanceCSVRow(row);
    expect(record.date).toBe('2026-01-15');
    expect(record.description).toBe('Salary');
    expect(record.income).toBe(5000);
    expect(record.type).toBe('Income');
    expect(record.done).toBe(true);
    expect(record.note).toBe('Monthly');
  });

  test('FU-15: parseFinanceCSVRow handles missing optional fields', () => {
    const row = ['2026-01-01', 'Test'];
    const record = parseFinanceCSVRow(row);
    expect(record.date).toBe('2026-01-01');
    expect(record.description).toBe('Test');
    expect(record.interestRate).toBe(0);
    expect(record.income).toBe(0);
    expect(record.type).toBe('');
    expect(record.note).toBe('');
  });

  test('FU-16: parseFinanceCSVRow converts TRUE/true to boolean for done field', () => {
    expect(parseFinanceCSVRow(['', '', '', '', '', '', '', '', '', '', 'TRUE']).done).toBe(true);
    expect(parseFinanceCSVRow(['', '', '', '', '', '', '', '', '', '', 'true']).done).toBe(true);
    expect(parseFinanceCSVRow(['', '', '', '', '', '', '', '', '', '', 'Yes']).done).toBe(true);
    expect(parseFinanceCSVRow(['', '', '', '', '', '', '', '', '', '', 'false']).done).toBe(false);
    expect(parseFinanceCSVRow(['', '', '', '', '', '', '', '', '', '', '']).done).toBe(false);
  });

  // --- isValidRecord ---

  test('FU-17: isValidRecord returns false for record without date', () => {
    expect(isValidRecord({ description: 'Test' })).toBe(false);
    expect(isValidRecord({ date: '', description: 'Test' })).toBe(false);
  });

  test('FU-18: isValidRecord returns false for record without description', () => {
    expect(isValidRecord({ date: '2026-01-01' })).toBe(false);
    expect(isValidRecord({ date: '2026-01-01', description: '' })).toBe(false);
  });

  test('FU-19: isValidRecord returns true for valid record', () => {
    expect(isValidRecord({ date: '2026-01-01', description: 'Test' })).toBe(true);
  });
});
