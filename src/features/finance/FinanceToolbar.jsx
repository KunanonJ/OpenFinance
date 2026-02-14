import { useFinanceStore } from '@store/financeStore';
import { exportFinanceCSV } from '@shared/lib/financeUtils';
import { FINANCE_TEMPLATE_COPY_URL } from '@shared/lib/financeConstants';
import { useFinanceSheetsSync } from '@features/finance/useFinanceSheetsSync';
import * as SheetsAPI from '@features/sync/sheetsApi';

export default function FinanceToolbar() {
  const records = useFinanceStore((s) => s.records);
  const { syncStatus, pullFinance } = useFinanceSheetsSync();
  const connected = SheetsAPI.isConnected();

  const handleExport = () => {
    const csv = exportFinanceCSV(records);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chameleon-finance-' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyTemplate = () => {
    window.open(FINANCE_TEMPLATE_COPY_URL, '_blank');
  };

  const btnClass = 'flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700';

  return (
    <div className="flex gap-2">
      <button onClick={handleExport} className={btnClass}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>

      <button onClick={handleCopyTemplate} className={btnClass}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Template
      </button>

      {connected && (
        <button
          onClick={pullFinance}
          disabled={syncStatus === 'syncing'}
          className={btnClass + ' disabled:opacity-50'}
        >
          <svg className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
        </button>
      )}
    </div>
  );
}
