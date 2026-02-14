import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFinanceStore = create(
  persist(
    (set) => ({
      records: [],
      filters: {
        type: 'all',
        dateRange: 'all',
      },

      addRecord: (record) => set((state) => ({
        records: [...state.records, {
          ...record,
          id: record.id || Date.now().toString() + Math.random().toString(36).slice(2, 8),
          lastModified: new Date().toISOString(),
        }],
      })),

      editRecord: (id, data) => set((state) => ({
        records: state.records.map((r) =>
          r.id === id ? { ...r, ...data, lastModified: new Date().toISOString() } : r
        ),
      })),

      removeRecord: (id) => set((state) => ({
        records: state.records.filter((r) => r.id !== id),
      })),

      setRecords: (records) => set({ records }),

      clearAll: () => set({ records: [] }),

      setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value },
      })),
    }),
    {
      name: 'chameleon_finance_data',
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          try {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.records)) {
              return { state: { records: parsed.records, filters: { type: 'all', dateRange: 'all' } } };
            }
            if (Array.isArray(parsed)) {
              return { state: { records: parsed, filters: { type: 'all', dateRange: 'all' } } };
            }
            return null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          const { records } = value.state;
          localStorage.setItem(name, JSON.stringify({ records }));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({ records: state.records }),
    }
  )
);
