import { persistenceIpcChannels } from '@application/contracts/persistence-ipc';
import { describe, expect, it } from 'vitest';
import { createApaScholarApi } from '@preload/api/create-apa-scholar-api';

describe('createApaScholarApi', () => {
  it('creates a typed desktop bridge surface for persistence flows', () => {
    const api = createApaScholarApi();

    expect(api.meta.bridgeVersion).toBe(1);
    expect(api.meta.platform).toBe('desktop');
    expect(api.meta.runtime).toBe('electron');
    expect(api.courses.list).toBeTypeOf('function');
    expect(api.courses.create).toBeTypeOf('function');
    expect(api.papers.listByCourse).toBeTypeOf('function');
    expect(api.papers.getById).toBeTypeOf('function');
    expect(api.papers.create).toBeTypeOf('function');
    expect(api.papers.updateBodyContent).toBeTypeOf('function');
    expect(api.papers.updateMetadata).toBeTypeOf('function');
    expect(api.search.query).toBeTypeOf('function');
  });

  it('routes preload methods through the shared IPC channels', async () => {
    const invoke = <TResult>(channel: string, payload?: unknown) =>
      Promise.resolve({ channel, payload } as TResult);
    const api = createApaScholarApi(invoke);

    await expect(api.courses.list()).resolves.toEqual({
      channel: persistenceIpcChannels.coursesList,
      payload: undefined,
    });
    await expect(
      api.courses.create({
        name: 'Research Methods',
      }),
    ).resolves.toEqual({
      channel: persistenceIpcChannels.coursesCreate,
      payload: {
        name: 'Research Methods',
      },
    });
    await expect(api.papers.listByCourse('course-1')).resolves.toEqual({
      channel: persistenceIpcChannels.papersListByCourse,
      payload: {
        courseId: 'course-1',
      },
    });
    await expect(api.papers.getById('paper-1')).resolves.toEqual({
      channel: persistenceIpcChannels.papersGetById,
      payload: {
        paperId: 'paper-1',
      },
    });
    await expect(
      api.papers.create({
        courseId: 'course-1',
        title: 'Literature Review',
      }),
    ).resolves.toEqual({
      channel: persistenceIpcChannels.papersCreate,
      payload: {
        courseId: 'course-1',
        title: 'Literature Review',
      },
    });
    await expect(
      api.papers.updateBodyContent('paper-1', {
        content: [
          {
            type: 'paragraph',
          },
        ],
        type: 'doc',
      }),
    ).resolves.toEqual({
      channel: persistenceIpcChannels.papersUpdateBodyContent,
      payload: {
        bodyDoc: {
          content: [
            {
              type: 'paragraph',
            },
          ],
          type: 'doc',
        },
        paperId: 'paper-1',
      },
    });
    await expect(
      api.papers.updateMetadata('paper-1', {
        abstractEnabled: true,
        paperType: 'professional',
        title: 'Faculty Draft',
      }),
    ).resolves.toEqual({
      channel: persistenceIpcChannels.papersUpdateMetadata,
      payload: {
        input: {
          abstractEnabled: true,
          paperType: 'professional',
          title: 'Faculty Draft',
        },
        paperId: 'paper-1',
      },
    });
    await expect(api.search.query('draft')).resolves.toEqual({
      channel: persistenceIpcChannels.searchQuery,
      payload: {
        query: 'draft',
      },
    });
  });
});
