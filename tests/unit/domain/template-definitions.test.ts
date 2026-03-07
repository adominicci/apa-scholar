import { describe, expect, it } from 'vitest';
import { createEmptyRichTextDocument } from '@domain/shared/entity-helpers';
import {
  getTemplateDefinition,
  listTemplateDefinitions,
} from '@domain/papers/template-definitions';

describe('template definitions', () => {
  it('exposes the supported student templates for paper creation flows', () => {
    expect(listTemplateDefinitions()).toEqual([
      {
        id: 'apa-student',
        label: 'APA Student Paper',
      },
      {
        id: 'apa-student-abstract',
        label: 'APA Student Paper with Abstract',
      },
    ]);
  });

  it('creates template seed data for the student paper with abstract variant', () => {
    const definition = getTemplateDefinition('apa-student-abstract');
    const seed = definition.createSeed({
      title: 'Capstone Draft',
    });

    expect(definition.id).toBe('apa-student-abstract');
    expect(definition.paperType).toBe('student');
    expect(seed.paperMeta.title).toBe('Capstone Draft');
    expect(seed.paperMeta.abstractEnabled).toBe(true);
    expect(seed.paperContent.abstractDoc).toEqual(createEmptyRichTextDocument());
    expect(seed.paperContent.bodyDoc).toEqual(createEmptyRichTextDocument());
  });

  it('keeps the professional template placeholder explicit for compatibility paths', () => {
    const definition = getTemplateDefinition('apa-professional');
    const seed = definition.createSeed({
      title: 'Faculty Draft',
    });

    expect(definition.paperType).toBe('professional');
    expect(seed.paperMeta.abstractEnabled).toBe(false);
    expect(seed.paperContent.bodyDoc).toEqual(createEmptyRichTextDocument());
  });
});
