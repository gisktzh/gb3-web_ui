import {ToolActions} from '../actions/tool.actions';
import {initialState, reducer, selectActiveTool, selectIsEditing} from './tool.reducer';

describe('map interaction state', () => {
  const target = {layerId: 'internal-statistics-area', graphicId: 'statistics-area'};
  it('replaces creation with an identified edit without storing a graphic', () => {
    const creating = reducer(initialState, ToolActions.startCreation({tool: 'draw-circle'}));
    const editing = reducer(creating, ToolActions.startEditing({tool: 'select-statistics-polygon', target}));
    expect(editing.interaction).toEqual({kind: 'edit', id: 2, tool: 'select-statistics-polygon', target});
    expect(selectActiveTool.projector(editing.interaction)).toBe('select-statistics-polygon');
    expect(selectIsEditing.projector(editing.interaction)).toBe(true);
  });
  it.each(['draw-polygon', 'measure-line', 'select-statistics-polygon'] as const)('releases %s on completion', (tool) => {
    const state = reducer(initialState, ToolActions.startCreation({tool}));
    expect(reducer(state, ToolActions.completeInteraction({interactionId: 1})).interaction).toEqual({kind: 'idle'});
  });
  it('retains completed download selection ownership', () => {
    const state = reducer(initialState, ToolActions.startCreation({tool: 'select-polygon'}));
    const selected = reducer(state, ToolActions.completeInteraction({interactionId: 1}));
    expect(selected.interaction).toEqual({kind: 'selected', id: 1, tool: 'select-polygon'});
    expect(reducer(selected, ToolActions.cancelInteraction()).interaction).toEqual({kind: 'idle'});
  });
  it('ignores stale completion and failure after cancellation and replacement', () => {
    const first = reducer(initialState, ToolActions.startCreation({tool: 'draw-line'}));
    const cancelled = reducer(first, ToolActions.cancelInteraction());
    const next = reducer(cancelled, ToolActions.startCreation({tool: 'draw-point'}));
    expect(reducer(next, ToolActions.completeInteraction({interactionId: 1}))).toBe(next);
    expect(reducer(next, ToolActions.interactionFailed({interactionId: 1, error: 'late'}))).toBe(next);
    expect(reducer(next, ToolActions.interactionFailed({interactionId: 2, error: 'missing'})).interaction).toEqual({kind: 'idle'});
  });
});
