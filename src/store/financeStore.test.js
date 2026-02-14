import { useFinanceStore } from '@store/financeStore';

describe('Finance Store', () => {
  beforeEach(() => {
    useFinanceStore.setState({ records: [], filters: { type: 'all', dateRange: 'all' } });
    localStorage.removeItem('chameleon_finance_data');
  });

  test('FN-1: default state has empty records array', () => {
    expect(useFinanceStore.getState().records).toEqual([]);
  });

  test('FN-2: addRecord adds a record with auto-generated id and lastModified', () => {
    useFinanceStore.getState().addRecord({ date: '2026-01-15', description: 'Salary', type: 'Income', income: 5000 });
    const { records } = useFinanceStore.getState();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBeTruthy();
    expect(records[0].lastModified).toBeTruthy();
    expect(records[0].description).toBe('Salary');
  });

  test('FN-3: addRecord preserves existing records', () => {
    useFinanceStore.getState().addRecord({ date: '2026-01-01', description: 'A', income: 100 });
    useFinanceStore.getState().addRecord({ date: '2026-01-02', description: 'B', expenses: 50 });
    expect(useFinanceStore.getState().records).toHaveLength(2);
  });

  test('FN-4: editRecord updates the correct record by id', () => {
    useFinanceStore.getState().addRecord({ date: '2026-01-01', description: 'Rent', expenses: 1000 });
    const id = useFinanceStore.getState().records[0].id;
    useFinanceStore.getState().editRecord(id, { expenses: 1200 });
    expect(useFinanceStore.getState().records[0].expenses).toBe(1200);
    expect(useFinanceStore.getState().records[0].description).toBe('Rent');
  });

  test('FN-5: editRecord sets new lastModified timestamp', () => {
    useFinanceStore.getState().addRecord({ date: '2026-01-01', description: 'Test' });
    const id = useFinanceStore.getState().records[0].id;
    useFinanceStore.getState().editRecord(id, { description: 'Updated' });
    const record = useFinanceStore.getState().records[0];
    expect(record.lastModified).toBeTruthy();
    expect(record.description).toBe('Updated');
  });

  test('FN-6: editRecord ignores non-existent id', () => {
    useFinanceStore.getState().addRecord({ date: '2026-01-01', description: 'Test' });
    useFinanceStore.getState().editRecord('nonexistent', { description: 'Changed' });
    expect(useFinanceStore.getState().records[0].description).toBe('Test');
  });

  test('FN-7: removeRecord removes the correct record', () => {
    useFinanceStore.getState().addRecord({ date: '2026-01-01', description: 'A' });
    useFinanceStore.getState().addRecord({ date: '2026-01-02', description: 'B' });
    const id = useFinanceStore.getState().records[0].id;
    useFinanceStore.getState().removeRecord(id);
    expect(useFinanceStore.getState().records).toHaveLength(1);
    expect(useFinanceStore.getState().records[0].description).toBe('B');
  });

  test('FN-8: removeRecord ignores non-existent id', () => {
    useFinanceStore.getState().addRecord({ date: '2026-01-01', description: 'A' });
    useFinanceStore.getState().removeRecord('nonexistent');
    expect(useFinanceStore.getState().records).toHaveLength(1);
  });

  test('FN-9: setRecords bulk-replaces all records', () => {
    useFinanceStore.getState().addRecord({ date: '2026-01-01', description: 'Old' });
    const newRecords = [{ id: '1', date: '2026-02-01', description: 'New1' }, { id: '2', date: '2026-02-02', description: 'New2' }];
    useFinanceStore.getState().setRecords(newRecords);
    expect(useFinanceStore.getState().records).toHaveLength(2);
    expect(useFinanceStore.getState().records[0].description).toBe('New1');
  });

  test('FN-10: clearAll resets to empty array', () => {
    useFinanceStore.getState().addRecord({ date: '2026-01-01', description: 'Test' });
    useFinanceStore.getState().clearAll();
    expect(useFinanceStore.getState().records).toEqual([]);
  });

  test('FN-11: setFilter updates type filter', () => {
    useFinanceStore.getState().setFilter('type', 'Income');
    expect(useFinanceStore.getState().filters.type).toBe('Income');
  });

  test('FN-12: setFilter updates dateRange filter', () => {
    useFinanceStore.getState().setFilter('dateRange', 'thisMonth');
    expect(useFinanceStore.getState().filters.dateRange).toBe('thisMonth');
  });

  test('FN-13: persistence round-trip', () => {
    useFinanceStore.getState().addRecord({ date: '2026-01-01', description: 'Persisted', income: 999 });
    // Verify localStorage was written
    const stored = localStorage.getItem('chameleon_finance_data');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(parsed.records).toHaveLength(1);
    expect(parsed.records[0].description).toBe('Persisted');
  });

  test('FN-14: corrupted localStorage returns default state', () => {
    localStorage.setItem('chameleon_finance_data', '{invalid json');
    useFinanceStore.persist.rehydrate();
    // Should not crash - records should be empty or unchanged
    expect(Array.isArray(useFinanceStore.getState().records)).toBe(true);
  });
});
