import { describe, expect, it } from 'vitest';
import { abstractEnabledTemplates } from '@domain/shared/contracts';

describe('shared template contracts', () => {
  it('centralizes which templates should initialize with abstracts enabled', () => {
    expect(abstractEnabledTemplates.has('apa-student-abstract')).toBe(true);
    expect(abstractEnabledTemplates.has('apa-student')).toBe(false);
    expect(abstractEnabledTemplates.has('apa-professional')).toBe(false);
  });
});
