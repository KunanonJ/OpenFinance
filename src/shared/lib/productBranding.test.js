import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const USER_FACING_FILES = [
  'src/App.jsx',
  'index.html',
  'public/manifest.json',
  'AI_HANDOFF.md',
];

const REMOVED_PRODUCT_PRD = 'Product Requirements Document_ Base44 - AI-Powered No-Code App Builder.md';

describe('product branding', () => {
  test('does not expose Base44 or no-code AI-builder positioning', () => {
    const forbidden = [
      /Base44/i,
      /AI-Powered/i,
      /No-Code/i,
      /AI-builder/i,
      /Builder Chat/i,
      /Discussion Mode/i,
      /natural-language workflow/i,
      /prompt parsing/i,
      /generated app blueprint/i,
    ];

    for (const file of USER_FACING_FILES) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf8');
      for (const pattern of forbidden) {
        expect(content, `${file} should not contain ${pattern}`).not.toMatch(pattern);
      }
    }

    expect(existsSync(resolve(process.cwd(), REMOVED_PRODUCT_PRD))).toBe(false);
  });
});
