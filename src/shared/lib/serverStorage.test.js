import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  backupToServer,
  buildServerPayload,
  restoreFromServer,
} from './serverStorage';

const VALID_TOKEN = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

describe('serverStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('buildServerPayload includes budget and trends from localStorage', () => {
    localStorage.setItem('subgrid_budget', JSON.stringify({ amount: 250, currency: 'USD' }));
    localStorage.setItem('subgrid_history', JSON.stringify([{ month: '2026-02', total: 99 }]));

    const payload = buildServerPayload({
      subscriptions: [{ id: 'sub-1' }],
      financeRecords: [{ id: 'rec-1' }],
      income: 1000,
    });

    expect(payload.subscriptions).toHaveLength(1);
    expect(payload.financeRecords).toHaveLength(1);
    expect(payload.income).toBe(1000);
    expect(payload.budget).toEqual({ amount: 250, currency: 'USD' });
    expect(payload.trends).toEqual([{ month: '2026-02', total: 99 }]);
  });

  it('backupToServer falls back to R2 when DB endpoint is unavailable', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'D1 database binding not configured' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, backupDate: '2026-02-17T00:00:00.000Z' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await backupToServer(VALID_TOKEN, { subscriptions: [] });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/db/backup');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/r2/backup');
    expect(result.storage).toBe('r2');
  });

  it('restoreFromServer prefers DB endpoint when available', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        subscriptions: [{ id: 's-1' }],
        financeRecords: [{ id: 'r-1' }],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await restoreFromServer(VALID_TOKEN);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/db/backup', expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({
        'X-User-Token': VALID_TOKEN,
      }),
    }));
    expect(result.subscriptions).toHaveLength(1);
  });
});
