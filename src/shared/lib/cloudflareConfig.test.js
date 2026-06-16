import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import capacitorConfig from '../../../capacitor.config.json';
import { onRequest as healthRequest } from '../../../functions/api/health.js';
import { onRequest as r2Request } from '../../../functions/api/r2.js';
import { onRequest as transactionsRequest } from '../../../functions/api/transactions.js';

describe('Cloudflare runtime configuration', () => {
  test('health endpoint reports live binding names from wrangler.jsonc', async () => {
    const response = await healthRequest({
      env: {
        ANALYTICS: {},
        R2_BUCKET: {},
        USER_DB: {},
      },
    });

    const body = await response.json();

    expect(body.status).toBe('ok');
    expect(body.bindings).toMatchObject({
      analytics: true,
      d1: true,
      r2: true,
    });
  });

  test('legacy r2 utility accepts the live R2_BUCKET binding', async () => {
    const bucket = {
      list: vi.fn().mockResolvedValue({ objects: [{ key: 'export.csv' }] }),
    };

    const response = await r2Request({
      env: { R2_BUCKET: bucket },
      request: new Request('https://example.test/api/r2'),
    });

    expect(response.status).toBe(200);
    expect(bucket.list).toHaveBeenCalledWith({ limit: 100 });
    await expect(response.json()).resolves.toEqual([{ key: 'export.csv' }]);
  });

  test('legacy transactions utility accepts the preferred USER_DB binding', async () => {
    const all = vi.fn().mockResolvedValue({ results: [{ id: 'txn-1' }] });
    const db = {
      exec: vi.fn().mockResolvedValue(undefined),
      prepare: vi.fn().mockReturnValue({ all }),
    };

    const response = await transactionsRequest({
      env: { USER_DB: db },
      request: new Request('https://example.test/api/transactions'),
    });

    expect(response.status).toBe(200);
    expect(db.exec).toHaveBeenCalledTimes(1);
    expect(db.prepare).toHaveBeenCalledWith(
      'SELECT id, date, description, amount, category FROM transactions ORDER BY date DESC LIMIT 100'
    );
    await expect(response.json()).resolves.toEqual([{ id: 'txn-1' }]);
  });

  test('wrangler.toml mirrors the live project and binding names', () => {
    const config = readFileSync(resolve(process.cwd(), 'wrangler.toml'), 'utf8');

    expect(config).toContain('name = "chameleon-finance"');
    expect(config).toContain('binding = "R2_BUCKET"');
    expect(config).not.toContain('abdull-finance');
    expect(config).not.toContain('ABDULL_');
  });
});

describe('Capacitor native shell configuration', () => {
  test('uses current design-system palette for native launch surfaces', () => {
    expect(capacitorConfig.plugins.SplashScreen.backgroundColor).toBe('#f9f2e6');
    expect(capacitorConfig.plugins.LocalNotifications.iconColor).toBe('#ff9901');
  });
});
