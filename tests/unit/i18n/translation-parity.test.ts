import { describe, expect, it } from 'vitest';
import en from '@renderer/i18n/resources/en';
import es from '@renderer/i18n/resources/es';
import { getGhostPageStrings } from '@domain/papers/ghost-page-strings';

const collectKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...collectKeys(value as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }

  return keys.sort();
};

describe('translation key parity', () => {
  const enKeys = collectKeys(en);
  const esKeys = collectKeys(es);

  it('EN and ES have the same number of keys', () => {
    expect(esKeys.length).toBe(enKeys.length);
  });

  it('every EN key exists in ES', () => {
    const missing = enKeys.filter((key) => !esKeys.includes(key));
    expect(missing).toEqual([]);
  });

  it('every ES key exists in EN', () => {
    const extra = esKeys.filter((key) => !enKeys.includes(key));
    expect(extra).toEqual([]);
  });

  it('no ES value is an empty string', () => {
    const empties: string[] = [];

    const check = (obj: Record<string, unknown>, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;

        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          check(value as Record<string, unknown>, path);
        } else if (value === '') {
          empties.push(path);
        }
      }
    };

    check(es);
    expect(empties).toEqual([]);
  });
});

describe('ghost page strings parity', () => {
  const enStrings = getGhostPageStrings('en');
  const esStrings = getGhostPageStrings('es');

  it('EN and ES have the same keys', () => {
    expect(Object.keys(esStrings).sort()).toEqual(
      Object.keys(enStrings).sort(),
    );
  });

  it('no ES ghost page string is empty', () => {
    const empties = Object.entries(esStrings)
      .filter(([, value]) => value === '')
      .map(([key]) => key);

    expect(empties).toEqual([]);
  });
});
