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
    const createPaper = vi
      .fn()
      .mockResolvedValue({ id: 'paper-2', courseId: 'course-1' });
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
        listByCourse: listPapersByCourse,
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
      handlers[persistenceIpcChannels.papersCreate]({
        courseId: 'course-1',
        title: 'Annotated Bibliography',
      }),
    ).resolves.toEqual({
      courseId: 'course-1',
      id: 'paper-2',
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
    expect(createPaper).toHaveBeenCalledWith({
      courseId: 'course-1',
      title: 'Annotated Bibliography',
    });
    expect(querySearch).toHaveBeenCalledWith('draft');
  });
});
