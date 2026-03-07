import { describe, expect, it } from 'vitest';
import {
  createInitialWorkspaceShellState,
  workspaceShellReducer,
} from '@renderer/app/workspace-shell-state';

describe('workspaceShellReducer', () => {
  it('navigates to a course while selecting and expanding it', () => {
    const initialState = createInitialWorkspaceShellState();

    const nextState = workspaceShellReducer(initialState, {
      type: 'navigateCourse',
      courseId: 'course-1',
    });

    expect(nextState.route).toEqual({
      courseId: 'course-1',
      view: 'course',
    });
    expect(nextState.selectedCourseId).toBe('course-1');
    expect(nextState.selectedPaperId).toBeNull();
    expect(nextState.expandedCourseIds).toContain('course-1');
  });

  it('navigates to a paper while preserving the parent course selection', () => {
    const initialState = createInitialWorkspaceShellState();

    const nextState = workspaceShellReducer(initialState, {
      type: 'navigatePaper',
      courseId: 'course-1',
      paperId: 'paper-1',
    });

    expect(nextState.route).toEqual({
      courseId: 'course-1',
      paperId: 'paper-1',
      view: 'paper',
    });
    expect(nextState.selectedCourseId).toBe('course-1');
    expect(nextState.selectedPaperId).toBe('paper-1');
    expect(nextState.expandedCourseIds).toContain('course-1');
  });

  it('toggles expanded course groups without changing the active route', () => {
    const initialState = createInitialWorkspaceShellState();
    const withExpandedCourse = workspaceShellReducer(initialState, {
      type: 'toggleCourseExpansion',
      courseId: 'course-1',
    });

    expect(withExpandedCourse.expandedCourseIds).toContain('course-1');
    expect(withExpandedCourse.route).toEqual({ view: 'home' });

    const collapsedAgain = workspaceShellReducer(withExpandedCourse, {
      type: 'toggleCourseExpansion',
      courseId: 'course-1',
    });

    expect(collapsedAgain.expandedCourseIds).not.toContain('course-1');
    expect(collapsedAgain.route).toEqual({ view: 'home' });
  });

  it('has both panels expanded in the initial state', () => {
    const initialState = createInitialWorkspaceShellState();

    expect(initialState.leftPanelCollapsed).toBe(false);
    expect(initialState.rightPanelCollapsed).toBe(false);
  });

  it('toggles left panel collapsed state', () => {
    const initialState = createInitialWorkspaceShellState();

    const collapsed = workspaceShellReducer(initialState, {
      type: 'toggleLeftPanel',
    });

    expect(collapsed.leftPanelCollapsed).toBe(true);

    const expanded = workspaceShellReducer(collapsed, {
      type: 'toggleLeftPanel',
    });

    expect(expanded.leftPanelCollapsed).toBe(false);
  });

  it('toggles right panel collapsed state', () => {
    const initialState = createInitialWorkspaceShellState();

    const collapsed = workspaceShellReducer(initialState, {
      type: 'toggleRightPanel',
    });

    expect(collapsed.rightPanelCollapsed).toBe(true);

    const expanded = workspaceShellReducer(collapsed, {
      type: 'toggleRightPanel',
    });

    expect(expanded.rightPanelCollapsed).toBe(false);
  });
});
