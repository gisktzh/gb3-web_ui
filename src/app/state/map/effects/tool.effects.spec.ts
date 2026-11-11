import {ErrorHandler} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideEffects} from '@ngrx/effects';
import {provideStore, Store} from '@ngrx/store';
import {firstValueFrom} from 'rxjs';
import {MAP_SERVICE} from '../../../app.tokens';
import {ToolActions} from '../actions/tool.actions';
import {DrawingActions} from '../actions/drawing.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {StatisticsActions} from '../actions/statistics.actions';
import {reducer as toolReducer, selectInteraction, selectActiveTool} from '../reducers/tool.reducer';
import {reducer as statisticsReducer, selectStatisticsState} from '../reducers/statistics.reducer';
import {reducer as drawingReducer, selectSelectedDrawing} from '../reducers/drawing.reducer';
import {reducer as mapUiReducer, selectIsDrawingEditOverlayVisible} from '../reducers/map-ui.reducer';
import {ToolEffects} from './tool.effects';
import {PolygonWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {Gb3StyledInternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';

describe('tool interaction effects with real reducers', () => {
  let store: Store;
  const tools = {startCreation: vi.fn(), startEditing: vi.fn(), finishInteraction: vi.fn(), cancelTool: vi.fn()};
  const errors = {handleError: vi.fn()};
  const target = {layerId: 'INTERNAL__statistics-area', graphicId: 'statistics-selection'};
  const geometry: PolygonWithSrs = {
    type: 'Polygon',
    srs: 2056,
    coordinates: [
      [
        [0, 0],
        [10, 0],
        [0, 10],
        [0, 0],
      ],
    ],
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({tool: toolReducer, statistics: statisticsReducer, drawing: drawingReducer, mapUi: mapUiReducer}),
        provideEffects(ToolEffects),
        {provide: MAP_SERVICE, useValue: {getToolService: () => tools}},
        {provide: ErrorHandler, useValue: errors},
      ],
    });
    store = TestBed.inject(Store);
  });

  it('starts exactly one creation and records ownership before initialization', () => {
    tools.startCreation.mockImplementation(() => {
      expect(firstValueFrom(store.select(selectInteraction))).resolves.toEqual({kind: 'create', tool: 'draw-polygon', id: 1});
    });
    store.dispatch(ToolActions.startCreation({tool: 'draw-polygon'}));
    expect(tools.startCreation).toHaveBeenCalledExactlyOnceWith('draw-polygon', 1);
    expect(tools.startEditing).not.toHaveBeenCalled();
  });

  it('edits statistics without starting creation or clearing selection and loaded results', async () => {
    store.dispatch(StatisticsActions.setSelection({geometry, radiusInMeters: undefined}));
    store.dispatch(StatisticsActions.updateContent({results: []}));
    const before = await firstValueFrom(store.select(selectStatisticsState));
    store.dispatch(ToolActions.startEditing({tool: 'select-statistics-polygon', target}));
    expect(tools.startEditing).toHaveBeenCalledExactlyOnceWith('select-statistics-polygon', target, 1);
    expect(tools.startCreation).not.toHaveBeenCalled();
    expect(await firstValueFrom(store.select(selectStatisticsState))).toEqual({...before, mode: 'polygon'});
    expect(await firstValueFrom(store.select(selectActiveTool))).toBe('select-statistics-polygon');
    store.dispatch(ToolActions.completeInteraction({interactionId: 1}));
    expect(await firstValueFrom(store.select(selectInteraction))).toEqual({kind: 'idle'});
    expect(tools.finishInteraction).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('retains completed download ownership and runtime until cancellation', async () => {
    store.dispatch(ToolActions.startCreation({tool: 'select-canton'}));
    store.dispatch(ToolActions.completeInteraction({interactionId: 1}));
    store.dispatch(ToolActions.completeInteraction({interactionId: 1}));
    expect(await firstValueFrom(store.select(selectInteraction))).toEqual({kind: 'selected', id: 1, tool: 'select-canton'});
    expect(tools.finishInteraction).not.toHaveBeenCalled();
    store.dispatch(ToolActions.cancelInteraction());
    expect(tools.cancelTool).toHaveBeenCalledOnce();
    expect(await firstValueFrom(store.select(selectInteraction))).toEqual({kind: 'idle'});
  });

  it('clears the statistics area only when creation is requested', async () => {
    store.dispatch(StatisticsActions.setSelection({geometry, radiusInMeters: undefined}));
    store.dispatch(ToolActions.startCreation({tool: 'select-statistics-polygon'}));
    const state = await firstValueFrom(store.select(selectStatisticsState));
    expect(state.mode).toBe('polygon');
    expect(state.geometry).toBeUndefined();
  });

  it('returns to idle and reports initialization failure while keeping effects available', async () => {
    const error = new Error('missing target');
    tools.startEditing.mockImplementationOnce(() => {
      throw error;
    });
    store.dispatch(ToolActions.startEditing({tool: 'select-statistics-polygon', target}));
    expect(await firstValueFrom(store.select(selectInteraction))).toEqual({kind: 'idle'});
    expect(tools.finishInteraction).toHaveBeenCalledWith(1);
    expect(errors.handleError).toHaveBeenCalledWith(error);
    store.dispatch(ToolActions.startCreation({tool: 'draw-point'}));
    expect(tools.startCreation).toHaveBeenCalledWith('draw-point', 2);
  });

  it('ignores late completion while a replacement edit is active', async () => {
    store.dispatch(ToolActions.startCreation({tool: 'draw-point'}));
    store.dispatch(ToolActions.startEditing({tool: 'select-statistics-polygon', target}));
    store.dispatch(ToolActions.completeInteraction({interactionId: 1}));
    expect(await firstValueFrom(store.select(selectInteraction))).toEqual({kind: 'edit', id: 2, tool: 'select-statistics-polygon', target});
    expect(tools.finishInteraction).not.toHaveBeenCalled();
  });

  it('opens a new drawing edit overlay after closing the previous one, then clears it on replacement', async () => {
    const drawing = {properties: {['__id']: 'drawing-id'}} as Gb3StyledInternalDrawingRepresentation;
    store.dispatch(DrawingActions.addDrawing({drawing}));
    tools.startEditing.mockImplementation(() => {
      store.dispatch(DrawingActions.selectDrawing({drawingId: 'drawing-id'}));
      store.dispatch(MapUiActions.setDrawingEditOverlayVisibility({isVisible: true}));
    });
    store.dispatch(ToolActions.startEditing({tool: 'draw-polygon', target: {...target, graphicId: 'drawing-id'}}));
    expect(await firstValueFrom(store.select(selectIsDrawingEditOverlayVisible))).toBe(true);
    expect(await firstValueFrom(store.select(selectSelectedDrawing))).toEqual(drawing);
    store.dispatch(ToolActions.startCreation({tool: 'measure-line'}));
    expect(await firstValueFrom(store.select(selectIsDrawingEditOverlayVisible))).toBe(false);
    expect(await firstValueFrom(store.select(selectSelectedDrawing))).toBeUndefined();
  });

  describe('switchTool$', () => {
    it.each(['select-statistics-circle', 'select-statistics-polygon'] as ToolType[])(
      'cancels edit mode, dispatches `StatisticsActions.clearContent` and activates the %s tool',
      (tool) => {
        const mapServiceCancelSpy = vi.spyOn(mapService, 'cancelEditMode');
        const expectedActions = [ToolActions.activateTool({tool})];
        actions$ = of(ToolActions.switchTool({tool}));
        const actualActions: Action[] = [];
        effects.switchTool$.subscribe((action) => actualActions.push(action));

        expect(mapServiceCancelSpy).toHaveBeenCalledOnce();
        expect(actualActions).toEqual(expectedActions);
      },
    );
  });
});
