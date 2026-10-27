import { describe, expect, it } from 'vitest';
import { DEFAULT_PERSISTED_STATE, safeLoadStorage, sanitizeName } from '../storage';

describe('Storage Resilience & XSS Sanitization (storage.ts)', () => {
  it('falls back cleanly to defaults when localStorage contains corrupted JSON', () => {
    const corruptedStorage = {
      getItem: () => '{broken_json:::',
    };
    const state = safeLoadStorage(corruptedStorage);
    expect(state.version).toBe('navdex_v1');
    expect(state.profile.displayName).toBe(DEFAULT_PERSISTED_STATE.profile.displayName);
  });

  it('strips HTML/script tags and caps names at 24 characters', () => {
    const dirty = '<script>alert(1)</script><img src=x onerror=alert(1)>Captain Whiskers The Third Of Bengaluru';
    const clean = sanitizeName(dirty, 'Mochi', 24);
    expect(clean).not.toContain('<');
    expect(clean).not.toContain('>');
    expect(clean).not.toContain('script');
    expect(clean.length).toBeLessThanOrEqual(24);
    expect(clean).toBe('Captain Whiskers The Thi');
  });
});
