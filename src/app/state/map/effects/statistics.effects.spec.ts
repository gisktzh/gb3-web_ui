import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {Observable, of, Subject, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {StatisticsEffects} from './statistics.effects';
import {StatisticsActions} from '../actions/statistics.actions';
import {QueryLocationActions} from '../actions/query-location.actions';
import {ToolActions} from '../actions/tool.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {
  selectAreaInSquareMeters,
  selectData,
  selectGeometry,
  selectHighlightedLayer,
  selectMode,
  selectRadiusInMeters,
} from '../reducers/statistics.reducer';
import {selectActiveTool} from '../reducers/tool.reducer';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MapService} from '../../../map/interfaces/map.service';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {MAP_SERVICE, STATISTICS_SERVICE} from '../../../app.tokens';
import {selectStatisticsQueries} from '../selectors/statistics-queries.selector';
import {StatisticsQuery, StatisticsResult} from '../../../shared/interfaces/statistics.interface';
import {selectQueryMode} from '../reducers/query-mode.reducer';
import {PolygonWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {deriveBoundingBoxCenter} from '../../../shared/utils/statistics-geometry.utils';
import {selectIsMapServiceInitialized, selectReady} from '../reducers/map-config.reducer';

describe('StatisticsEffects', () => {
  let actions$: Observable<Action>;
  let effects: StatisticsEffects;
  let store: MockStore;
  const statisticsService = {loadStatistics: vi.fn()};
  const queries: StatisticsQuery[] = [{topic: 'StatBeschaeftigteZH', layer: 'stat-ent-p', field: ['anz_besch'], statistic: 'sum'}];

  const square: PolygonWithSrs = {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [0, 100],
        [100, 100],
        [100, 0],
        [0, 0],
      ],
    ],
    srs: 2056,
  };

  beforeEach(() => {
    actions$ = new Observable<Action>();
    statisticsService.loadStatistics.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        StatisticsEffects,
        MapDrawingService,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        {provide: STATISTICS_SERVICE, useValue: statisticsService},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    effects = TestBed.inject(StatisticsEffects);
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectStatisticsQueries, queries);
    store.overrideSelector(selectAreaInSquareMeters, 10_000);
    store.overrideSelector(selectQueryMode, 'feature');
    store.overrideSelector(selectData, []);
    store.overrideSelector(selectHighlightedLayer, undefined);
    store.overrideSelector(selectReady, false);
    store.overrideSelector(selectIsMapServiceInitialized, true);
    TestBed.inject<MapService>(MAP_SERVICE);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  it('invalidates results only when the eligible query list changes', () => {
    const actual: Action[] = [];
    const subscription = effects.invalidateOnLayerChanges$.subscribe((action) => actual.push(action));
    store.overrideSelector(selectStatisticsQueries, [...queries]);
    store.refreshState();
    expect(actual).toEqual([]);
    store.overrideSelector(selectStatisticsQueries, []);
    store.refreshState();
    expect(actual).toEqual([StatisticsActions.invalidateContent()]);
    subscription.unsubscribe();
  });

  describe('highlightResults$', () => {
    beforeEach(() => {
      store.overrideSelector(selectHighlightedLayer, {topic: 'StatBeschaeftigteZH', layer: 'stat-ent-p'});
    });
    const results: StatisticsResult[] = [
      {
        topic: 'StatBeschaeftigteZH',
        title: 'Beschäftigte',
        layers: [
          {layer: 'stat-ent-p', title: 'Beschäftigte', columns: ['Summe'], rows: [], status: 'ok', featureGeometry: square},
          {layer: 'no-geometry', title: 'No geometry', columns: ['Summe'], rows: [], status: 'noData'},
        ],
      },
    ];

    it('waits for map readiness and shows returned geometries only while the statistics tab is active', () => {
      const drawing = TestBed.inject(MapDrawingService);
      const draw = vi.spyOn(drawing, 'drawStatisticsHighlights');
      const clear = vi.spyOn(drawing, 'clearStatisticsHighlights');
      store.overrideSelector(selectData, results);
      store.overrideSelector(selectQueryMode, 'statistics');
      store.overrideSelector(selectIsMapServiceInitialized, false);
      const subscription = effects.highlightResults$.subscribe();
      expect(draw).not.toHaveBeenCalled();
      expect(clear).not.toHaveBeenCalled();

      store.overrideSelector(selectReady, true);
      store.refreshState();
      expect(draw).not.toHaveBeenCalled();
      store.overrideSelector(selectIsMapServiceInitialized, true);
      store.refreshState();
      expect(draw).toHaveBeenLastCalledWith([square]);
      store.overrideSelector(selectQueryMode, 'feature');
      store.refreshState();
      expect(clear).toHaveBeenCalled();
      draw.mockClear();
      store.overrideSelector(selectData, []);
      store.refreshState();
      expect(draw).not.toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('avoids map calls after deinitialization and redraws cached results when the map is initialized again', () => {
      const drawing = TestBed.inject(MapDrawingService);
      const draw = vi.spyOn(drawing, 'drawStatisticsHighlights');
      const clear = vi.spyOn(drawing, 'clearStatisticsHighlights');
      store.overrideSelector(selectReady, true);
      store.overrideSelector(selectData, results);
      store.overrideSelector(selectQueryMode, 'statistics');
      const subscription = effects.highlightResults$.subscribe();
      expect(draw).toHaveBeenLastCalledWith([square]);
      draw.mockClear();
      clear.mockClear();
      store.overrideSelector(selectIsMapServiceInitialized, false);
      store.refreshState();
      store.overrideSelector(selectData, []);
      store.refreshState();
      expect(draw).not.toHaveBeenCalled();
      expect(clear).not.toHaveBeenCalled();
      store.overrideSelector(selectData, results);
      store.refreshState();
      store.overrideSelector(selectIsMapServiceInitialized, true);
      store.refreshState();
      expect(draw).toHaveBeenLastCalledWith([square]);
      subscription.unsubscribe();
    });

    it('restores cached geometries on tab return and removes them when results are cleared', () => {
      const draw = vi.spyOn(TestBed.inject(MapDrawingService), 'drawStatisticsHighlights');
      store.overrideSelector(selectReady, true);
      store.overrideSelector(selectData, results);
      store.overrideSelector(selectQueryMode, 'statistics');
      const subscription = effects.highlightResults$.subscribe();
      expect(draw).toHaveBeenLastCalledWith([square]);
      store.overrideSelector(selectQueryMode, 'feature');
      store.refreshState();
      store.overrideSelector(selectQueryMode, 'statistics');
      store.refreshState();
      expect(draw).toHaveBeenLastCalledWith([square]);
      store.overrideSelector(selectData, []);
      store.refreshState();
      expect(draw).toHaveBeenLastCalledWith([]);
      subscription.unsubscribe();
    });
  });

  describe('renderSelection$', () => {
    it('waits for initialization, restores cached areas, and hides them outside statistics', () => {
      const drawing = TestBed.inject(MapDrawingService);
      const draw = vi.spyOn(drawing, 'drawStatisticsArea').mockImplementation(vi.fn());
      const clear = vi.spyOn(drawing, 'clearStatisticsArea');
      store.overrideSelector(selectGeometry, square);
      store.overrideSelector(selectQueryMode, 'statistics');
      store.overrideSelector(selectReady, true);
      store.overrideSelector(selectIsMapServiceInitialized, false);
      const subscription = effects.renderSelection$.subscribe();
      expect(draw).not.toHaveBeenCalled();
      expect(clear).not.toHaveBeenCalled();
      store.overrideSelector(selectIsMapServiceInitialized, true);
      store.refreshState();
      expect(draw).toHaveBeenCalledOnce();
      expect(draw).toHaveBeenLastCalledWith(square);
      store.overrideSelector(selectIsMapServiceInitialized, false);
      store.refreshState();
      store.overrideSelector(selectIsMapServiceInitialized, true);
      store.refreshState();
      expect(draw).toHaveBeenCalledTimes(2);
      store.overrideSelector(selectQueryMode, 'feature');
      store.refreshState();
      expect(clear).toHaveBeenCalledOnce();
      store.overrideSelector(selectQueryMode, 'statistics');
      store.refreshState();
      expect(draw).toHaveBeenCalledTimes(3);
      store.overrideSelector(selectGeometry, undefined);
      store.refreshState();
      expect(clear).toHaveBeenCalledTimes(2);
      subscription.unsubscribe();
    });
  });

  it.each([
    StatisticsActions.setSelection({geometry: square, radiusInMeters: undefined}),
    StatisticsActions.invalidateContent(),
    StatisticsActions.clearContent(),
  ])('cancels a pending request on $type', (action) => {
    const source = new Subject<Action>();
    actions$ = source;
    store.overrideSelector(selectGeometry, square);
    const teardown = vi.fn();
    statisticsService.loadStatistics.mockReturnValue(new Observable(() => teardown));
    const actual: Action[] = [];
    const subscription = effects.loadStatistics$.subscribe((result) => actual.push(result));
    source.next(StatisticsActions.sendRequest());
    source.next(action);
    expect(teardown).toHaveBeenCalledOnce();
    expect(actual).toEqual([]);
    subscription.unsubscribe();
  });

  describe('recenterSelectionOnPointChange$', () => {
    it('creates a circle with the current radius around the clicked point in the umkreis mode', () => {
      store.overrideSelector(selectMode, 'umkreis');
      store.overrideSelector(selectGeometry, undefined);
      store.overrideSelector(selectRadiusInMeters, 500);

      actions$ = of(QueryLocationActions.setPoint({point: {type: 'Point', coordinates: [2683000, 1247000], srs: 2056}, scale: 1000}));

      let actualAction;
      effects.recenterSelectionOnPointChange$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(
        StatisticsActions.setSelection({
          geometry: expect.objectContaining({type: 'Polygon'}),
          radiusInMeters: undefined,
        }),
      );
    });

    /** This is the regression the radius input caused: it used to detach the selection from any further map click. */
    it('keeps following map clicks after the radius has been changed', () => {
      store.overrideSelector(selectMode, 'umkreis');
      store.overrideSelector(selectGeometry, square);
      store.overrideSelector(selectRadiusInMeters, 250);

      actions$ = of(QueryLocationActions.setPoint({point: {type: 'Point', coordinates: [10, 20], srs: 2056}, scale: 1000}));

      let actualAction;
      effects.recenterSelectionOnPointChange$.subscribe((action) => (actualAction = action));

      expect(actualAction).toBeDefined();
    });

    it('moves the drawn polygon onto the clicked point in the polygon mode', () => {
      store.overrideSelector(selectMode, 'polygon');
      store.overrideSelector(selectGeometry, square);
      store.overrideSelector(selectRadiusInMeters, 500);

      actions$ = of(QueryLocationActions.setPoint({point: {type: 'Point', coordinates: [1000, 2000], srs: 2056}, scale: 1000}));

      let actualAction: Action | undefined;
      effects.recenterSelectionOnPointChange$.subscribe((action) => (actualAction = action));

      const {geometry} = actualAction as ReturnType<typeof StatisticsActions.setSelection>;
      expect(deriveBoundingBoxCenter(geometry)?.coordinates).toEqual([1000, 2000]);
      // The shape has to survive the move, so the polygon still spans 100 by 100 metres.
      expect(geometry).toEqual(expect.objectContaining({type: 'Polygon'}));
      expect((geometry as PolygonWithSrs).coordinates[0]).toHaveLength(5);
    });

    it('ignores the click in the polygon mode while no polygon has been drawn', async () => {
      store.overrideSelector(selectMode, 'polygon');
      store.overrideSelector(selectGeometry, undefined);
      store.overrideSelector(selectRadiusInMeters, 500);

      actions$ = of(QueryLocationActions.setPoint({point: {type: 'Point', coordinates: [1000, 2000], srs: 2056}, scale: 1000}));

      vi.useFakeTimers();
      let actualAction;
      effects.recenterSelectionOnPointChange$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();
      vi.useRealTimers();

      expect(actualAction).toBeUndefined();
    });
  });

  describe('clearOnFeatureInfoClose$', () => {
    it('clears the area when the info overlay is closed', () => {
      actions$ = of(MapConfigActions.clearFeatureInfoContent());

      let actualAction;
      effects.clearOnFeatureInfoClose$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(StatisticsActions.clearContent());
    });
  });

  describe('restartSelectionOnModeChange$', () => {
    it('clears the area and hands over the circle tool for the umkreis mode', () => {
      store.overrideSelector(selectActiveTool, undefined);
      actions$ = of(StatisticsActions.setMode({mode: 'umkreis'}));

      const actualActions: Action[] = [];
      effects.restartSelectionOnModeChange$.subscribe((action) => actualActions.push(action));

      expect(actualActions).toEqual([StatisticsActions.clearContent(), ToolActions.activateTool({tool: 'select-statistics-circle'})]);
    });

    it('clears the area and hands over the polygon tool for the polygon mode', () => {
      store.overrideSelector(selectActiveTool, undefined);
      actions$ = of(StatisticsActions.setMode({mode: 'polygon'}));

      const actualActions: Action[] = [];
      effects.restartSelectionOnModeChange$.subscribe((action) => actualActions.push(action));

      expect(actualActions).toEqual([StatisticsActions.clearContent(), ToolActions.activateTool({tool: 'select-statistics-polygon'})]);
    });

    /** Re-activating the running tool would restart it, and the mode sync would answer with another mode change. */
    it('does not hand over the tool that is already drawing', () => {
      store.overrideSelector(selectActiveTool, 'select-statistics-polygon');
      actions$ = of(StatisticsActions.setMode({mode: 'polygon'}));

      const actualActions: Action[] = [];
      effects.restartSelectionOnModeChange$.subscribe((action) => actualActions.push(action));

      expect(actualActions).toEqual([StatisticsActions.clearContent()]);
    });
  });

  describe('syncModeWithSelectionTool$', () => {
    it('follows a selection tool started from the tool bar into its mode', () => {
      store.overrideSelector(selectMode, 'umkreis');
      actions$ = of(ToolActions.activateTool({tool: 'select-statistics-polygon'}));

      let actualAction;
      effects.syncModeWithSelectionTool$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(StatisticsActions.setMode({mode: 'polygon'}));
    });

    it('stays quiet for the mode that is already selected', async () => {
      store.overrideSelector(selectMode, 'polygon');
      actions$ = of(ToolActions.activateTool({tool: 'select-statistics-polygon'}));

      vi.useFakeTimers();
      let actualAction;
      effects.syncModeWithSelectionTool$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();
      vi.useRealTimers();

      expect(actualAction).toBeUndefined();
    });

    it('ignores tools that have nothing to do with statistics', async () => {
      store.overrideSelector(selectMode, 'umkreis');
      actions$ = of(ToolActions.activateTool({tool: 'measure-line'}));

      vi.useFakeTimers();
      let actualAction;
      effects.syncModeWithSelectionTool$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();
      vi.useRealTimers();

      expect(actualAction).toBeUndefined();
    });
  });

  describe('openOverlayOnRequest$', () => {
    it('opens the panel for statistics selections even when area validation prevents an API request', () => {
      store.overrideSelector(selectQueryMode, 'statistics');
      actions$ = of(StatisticsActions.setSelection({geometry: square, radiusInMeters: undefined}));
      let actualAction;
      effects.openOverlayOnRequest$.subscribe((action) => (actualAction = action));
      expect(actualAction).toEqual(MapUiActions.setFeatureInfoVisibility({isVisible: true}));
    });
    it('opens the info overlay for the results it is about to load', () => {
      actions$ = of(StatisticsActions.sendRequest());

      let actualAction;
      effects.openOverlayOnRequest$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(MapUiActions.setFeatureInfoVisibility({isVisible: true}));
    });

    describe('loadStatistics$', () => {
      it('does not query an oversized area, even if a request is dispatched directly', () => {
        store.overrideSelector(selectGeometry, square);
        store.overrideSelector(selectAreaInSquareMeters, 42_000_001);
        actions$ = of(StatisticsActions.sendRequest());
        let actualAction;
        effects.loadStatistics$.subscribe((action) => (actualAction = action));
        expect(statisticsService.loadStatistics).not.toHaveBeenCalled();
        expect(actualAction).toEqual(StatisticsActions.invalidateContent());
      });
      it('does not call the API when no active layers support statistics', () => {
        store.overrideSelector(selectGeometry, square);
        store.overrideSelector(selectStatisticsQueries, []);
        actions$ = of(StatisticsActions.sendRequest());
        let actualAction;
        effects.loadStatistics$.subscribe((action) => (actualAction = action));
        expect(statisticsService.loadStatistics).not.toHaveBeenCalled();
        expect(actualAction).toEqual(StatisticsActions.updateContent({results: []}));
      });
      it('loads statistics for the selected geometry', () => {
        store.overrideSelector(selectGeometry, square);
        actions$ = of(StatisticsActions.sendRequest());

        let actualAction;
        effects.loadStatistics$.subscribe((action) => (actualAction = action));

        expect(statisticsService.loadStatistics).toHaveBeenCalledExactlyOnceWith(square, queries);
        expect(actualAction).toEqual(StatisticsActions.updateContent({results: []}));
      });

      it('surfaces endpoint errors in the statistics state', () => {
        const error = new Error('Statistics request failed');
        statisticsService.loadStatistics.mockReturnValue(throwError(() => error));
        store.overrideSelector(selectGeometry, square);
        actions$ = of(StatisticsActions.sendRequest());

        let actualAction;
        effects.loadStatistics$.subscribe((action) => (actualAction = action));

        expect(actualAction).toEqual(StatisticsActions.setError({error}));
      });

      it('clears content without querying when no area is selected', () => {
        store.overrideSelector(selectGeometry, undefined);
        actions$ = of(StatisticsActions.sendRequest());

        let actualAction;
        effects.loadStatistics$.subscribe((action) => (actualAction = action));

        expect(statisticsService.loadStatistics).not.toHaveBeenCalled();
        expect(actualAction).toEqual(StatisticsActions.clearContent());
      });
    });
  });
});
