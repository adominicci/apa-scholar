export type WorkspaceRoute =
  | { view: 'home' }
  | { view: 'course'; courseId: string }
  | { view: 'paper'; courseId: string; paperId: string }
  | { view: 'settings' };

export type InspectorTab = 'details' | 'issues' | 'references';

export interface WorkspaceShellState {
  route: WorkspaceRoute;
  selectedCourseId: string | null;
  selectedPaperId: string | null;
  expandedCourseIds: string[];
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  inspectorTab: InspectorTab;
}

export type WorkspaceShellAction =
  | { type: 'navigateHome' }
  | { type: 'navigateSettings' }
  | { type: 'navigateCourse'; courseId: string }
  | { type: 'navigatePaper'; courseId: string; paperId: string }
  | { type: 'toggleCourseExpansion'; courseId: string }
  | { type: 'toggleLeftPanel' }
  | { type: 'toggleRightPanel' }
  | { type: 'set-inspector-tab'; tab: InspectorTab };

const toggleInList = (items: string[], value: string): string[] =>
  items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];

const ensureExpanded = (items: string[], value: string): string[] =>
  items.includes(value) ? items : [...items, value];

export const createInitialWorkspaceShellState = (): WorkspaceShellState => ({
  expandedCourseIds: [],
  inspectorTab: 'details',
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  route: { view: 'home' },
  selectedCourseId: null,
  selectedPaperId: null,
});

export const workspaceShellReducer = (
  state: WorkspaceShellState,
  action: WorkspaceShellAction,
): WorkspaceShellState => {
  switch (action.type) {
    case 'navigateHome':
      return {
        ...state,
        route: { view: 'home' },
        selectedCourseId: null,
        selectedPaperId: null,
      };
    case 'navigateSettings':
      return {
        ...state,
        route: { view: 'settings' },
        selectedCourseId: null,
        selectedPaperId: null,
      };
    case 'navigateCourse':
      return {
        ...state,
        expandedCourseIds: ensureExpanded(
          state.expandedCourseIds,
          action.courseId,
        ),
        route: { courseId: action.courseId, view: 'course' },
        selectedCourseId: action.courseId,
        selectedPaperId: null,
      };
    case 'navigatePaper':
      return {
        ...state,
        expandedCourseIds: ensureExpanded(
          state.expandedCourseIds,
          action.courseId,
        ),
        route: {
          courseId: action.courseId,
          paperId: action.paperId,
          view: 'paper',
        },
        selectedCourseId: action.courseId,
        selectedPaperId: action.paperId,
      };
    case 'toggleCourseExpansion':
      return {
        ...state,
        expandedCourseIds: toggleInList(
          state.expandedCourseIds,
          action.courseId,
        ),
      };
    case 'toggleLeftPanel':
      return {
        ...state,
        leftPanelCollapsed: !state.leftPanelCollapsed,
      };
    case 'toggleRightPanel':
      return {
        ...state,
        rightPanelCollapsed: !state.rightPanelCollapsed,
      };
    case 'set-inspector-tab':
      return {
        ...state,
        inspectorTab: action.tab,
        rightPanelCollapsed: false,
      };
  }
};
