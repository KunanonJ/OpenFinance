import { useState } from 'react';
import { getColor } from '@shared/lib/constants';
import { getLogoProxyUrl } from '@shared/lib/logo';
import { CATEGORIES } from '@shared/lib/categories';
import { formatOriginalMonthly, formatOriginalPrice } from '@shared/lib/currencies';
import { useCurrencyStore } from '@store/currencyStore';
import {
  calculateNextRenewal,
  getDaysUntilRenewal,
  getRenewalBadgeClass,
  getRenewalBadgeText,
} from '@features/reminders/useReminders';

const renewalBadgeTone = {
  'renewal-badge-urgent': 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  'renewal-badge-warning': 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  'renewal-badge-normal': 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
};

function formatCardDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export default function SubscriptionCard({ sub, onEdit, onRemove }) {
  const selectedCurrency = useCurrencyStore((s) => s.selectedCurrency);
  const currencies = useCurrencyStore((s) => s.currencies);
  const [iconError, setIconError] = useState(false);

  const color = getColor(sub.color);
  const category = Object.values(CATEGORIES).find((c) => c.id === sub.category) || CATEGORIES.OTHER;
  const cycle = sub.cycle || 'Monthly';
  const renewalDate = sub.startDate ? calculateNextRenewal(sub.startDate, cycle) : null;
  const daysUntilRenewal = renewalDate ? getDaysUntilRenewal(renewalDate) : null;
  const showRenewalPill = daysUntilRenewal !== null && daysUntilRenewal <= 30;
  const renewalBadgeClass = showRenewalPill ? getRenewalBadgeClass(daysUntilRenewal) : null;
  const renewalTone = renewalBadgeClass ? renewalBadgeTone[renewalBadgeClass] : '';
  const formattedRenewalDate = renewalDate ? formatCardDate(renewalDate) : 'Not set';

  const logoUrl = getLogoProxyUrl(sub.url);
  const initial = (sub.name || '?')[0].toUpperCase();

  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:p-4 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">
      <div
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
        onClick={() => onEdit(sub.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit(sub.id);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div
          className="h-10 w-1 shrink-0 rounded-full"
          style={{ background: `linear-gradient(180deg, ${color.bg} 0%, ${color.accent} 100%)` }}
        />
        {logoUrl && !iconError ? (
          <img
            src={logoUrl}
            className="h-10 w-10 shrink-0 rounded-lg object-contain"
            crossOrigin="anonymous"
            alt={sub.name}
            onError={() => setIconError(true)}
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate font-bold text-slate-900 dark:text-slate-100">
              {sub.name || 'Untitled subscription'}
            </span>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {category.name}
            </span>
            {showRenewalPill && (
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${renewalTone}`}>
                Renews {getRenewalBadgeText(daysUntilRenewal)}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>~{formatOriginalMonthly(sub, selectedCurrency, currencies)}/mo</span>
            <span>Next: {formattedRenewalDate}</span>
          </div>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {formatOriginalPrice(sub, selectedCurrency, currencies)}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">/{cycle}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onEdit(sub.id)}
          aria-label={`Edit ${sub.name || 'subscription'}`}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={() => onRemove(sub.id)}
          aria-label={`Delete ${sub.name || 'subscription'}`}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-red-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
