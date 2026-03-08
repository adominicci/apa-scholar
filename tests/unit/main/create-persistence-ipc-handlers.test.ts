import { describe, expect, it, vi } from 'vitest';
import { persistenceIpcChannels } from '@application/contracts/persistence-ipc';
import { createPersistenceIpcHandlers } from '@main/ipc/create-persistence-ipc-handlers';

describe('createPersistenceIpcHandlers', () => {
  it('routes course and paper IPC channels through application services', async () => {
    const listCourses = vi.fn().mockResolvedValue([{ id: 'course-1' }]);
    const createCourse = vi
      .fn()
      .mockResolvedValue({ id: 'course-2', name: 'Research Methods' });
    const listPapersByCourse = vi
      .fn()
      .mockResolvedValue([{ id: 'paper-1', courseId: 'course-1' }]);
    const getPaperById = vi
      .fn()
      .mockResolvedValue({ paper: { id: 'paper-1' }, ghostPages: [] });
    const createPaper = vi
      .fn()
      .mockResolvedValue({ id: 'paper-2', courseId: 'course-1' });
    const updatePaperBodyContent = vi
      .fn()
      .mockResolvedValue({
        ghostPages: [],
        paper: { id: 'paper-1', title: 'Faculty Draft' },
      });
    const updatePaperMetadata = vi
      .fn()
      .mockResolvedValue({
        ghostPages: [],
        paper: { id: 'paper-1', title: 'Faculty Draft' },
      });
    const querySearch = vi.fn().mockResolvedValue({
      courses: [],
      papers: [],
      status: 'placeholder',
    });

    const handlers = createPersistenceIpcHandlers({
      courses: {
        create: createCourse,
        list: listCourses,
      },
      papers: {
        create: createPaper,
        getById: getPaperById,
        listByCourse: listPapersByCourse,
        updateBodyContent: updatePaperBodyContent,
        updateMetadata: updatePaperMetadata,
      },
      search: {
        query: querySearch,
      },
    });

    await expect(
      handlers[persistenceIpcChannels.coursesList](),
    ).resolves.toEqual([{ id: 'course-1' }]);
    await expect(
      handlers[persistenceIpcChannels.coursesCreate]({
        name: 'Research Methods',
      }),
    ).resolves.toEqual({
      id: 'course-2',
      name: 'Research Methods',
    });
    await expect(
      handlers[persistenceIpcChannels.papersListByCourse]({
        courseId: 'course-1',
      }),
    ).resolves.toEqual([{ id: 'paper-1', courseId: 'course-1' }]);
    await expect(
      handlers[persistenceIpcChannels.papersGetById]({
        paperId: 'paper-1',
      }),
    ).resolves.toEqual({
      ghostPages: [],
      paper: { id: 'paper-1' },
    });
    await expect(
      handlers[persistenceIpcChannels.papersCreate]({
        courseId: 'course-1',
        title: 'Annotated Bibliography',
      }),
    ).resolves.toEqual({
      courseId: 'course-1',
      id: 'paper-2',
    });
    await expect(
      handlers[persistenceIpcChannels.papersUpdateBodyContent]({
        bodyDoc: {
          content: [
            {
              type: 'paragraph',
            },
          ],
          type: 'doc',
        },
        paperId: 'paper-1',
      }),
    ).resolves.toEqual({
      ghostPages: [],
      paper: { id: 'paper-1', title: 'Faculty Draft' },
    });
    await expect(
      handlers[persistenceIpcChannels.papersUpdateMetadata]({
        input: {
          abstractEnabled: true,
          paperType: 'professional',
          title: 'Faculty Draft',
        },
        paperId: 'paper-1',
      }),
    ).resolves.toEqual({
      ghostPages: [],
      paper: { id: 'paper-1', title: 'Faculty Draft' },
    });
    await expect(
      handlers[persistenceIpcChannels.searchQuery]({
        query: 'draft',
      }),
    ).resolves.toEqual({
      courses: [],
      papers: [],
      status: 'placeholder',
    });

    expect(listCourses).toHaveBeenCalledTimes(1);
    expect(createCourse).toHaveBeenCalledWith({ name: 'Research Methods' });
    expect(listPapersByCourse).toHaveBeenCalledWith('course-1');
    expect(getPaperById).toHaveBeenCalledWith('paper-1');
    expect(createPaper).toHaveBeenCalledWith({
      courseId: 'course-1',
      title: 'Annotated Bibliography',
    });
    expect(updatePaperBodyContent).toHaveBeenCalledWith('paper-1', {
      content: [
        {
          type: 'paragraph',
        },
      ],
      type: 'doc',
    });
    expect(updatePaperMetadata).toHaveBeenCalledWith('paper-1', {
      abstractEnabled: true,
      paperType: 'professional',
      title: 'Faculty Draft',
    });
    expect(querySearch).toHaveBeenCalledWith('draft');
  });
});
