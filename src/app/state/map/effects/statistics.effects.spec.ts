import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {StatisticsEffects} from './statistics.effects';
import {StatisticsActions} from '../actions/statistics.actions';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {ToolActions} from '../actions/tool.actions';
import {selectGeometry, selectMode, selectRadiusInMeters} from '../reducers/statistics.reducer';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MapService} from '../../../map/interfaces/map.service';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {MAP_SERVICE} from '../../../app.tokens';
import {StatisticsService} from '../../../shared/services/apis/gb3/abstract-statistics.service';
import {Gb3StatisticsMockService} from '../../../shared/services/apis/gb3/gb3-statistics-mock.service';
import {PolygonWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {deriveBoundingBoxCenter} from '../../../shared/utils/statistics-geometry.utils';

describe('StatisticsEffects', () => {
  let actions$: Observable<Action>;
  let effects: StatisticsEffects;
  let store: MockStore;

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

    TestBed.configureTestingModule({
      providers: [
        StatisticsEffects,
        MapDrawingService,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        {provide: StatisticsService, useClass: Gb3StatisticsMockService},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    effects = TestBed.inject(StatisticsEffects);
    store = TestBed.inject(MockStore);
    TestBed.inject<MapService>(MAP_SERVICE);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('recenterSelectionOnMapClick$', () => {
    it('creates a circle with the current radius around the clicked point in the umkreis mode', () => {
      store.overrideSelector(selectMode, 'umkreis');
      store.overrideSelector(selectGeometry, undefined);
      store.overrideSelector(selectRadiusInMeters, 500);

      actions$ = of(FeatureInfoActions.sendRequest({x: 2683000, y: 1247000, scale: 1000}));

      let actualAction;
      effects.recenterSelectionOnMapClick$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(
        StatisticsActions.setSelection({
          geometry: expect.objectContaining({type: 'Polygon'}),
          center: expect.objectContaining({coordinates: [2683000, 1247000]}),
          radiusInMeters: undefined,
        }),
      );
    });

    /** This is the regression the radius input caused: it used to detach the selection from any further map click. */
    it('keeps following map clicks after the radius has been changed', () => {
      store.overrideSelector(selectMode, 'umkreis');
      store.overrideSelector(selectGeometry, square);
      store.overrideSelector(selectRadiusInMeters, 250);

      actions$ = of(FeatureInfoActions.sendRequest({x: 10, y: 20, scale: 1000}));

      let actualAction;
      effects.recenterSelectionOnMapClick$.subscribe((action) => (actualAction = action));

      expect(actualAction).toBeDefined();
    });

    it('moves the drawn polygon onto the clicked point in the polygon mode', () => {
      store.overrideSelector(selectMode, 'polygon');
      store.overrideSelector(selectGeometry, square);
      store.overrideSelector(selectRadiusInMeters, 500);

      actions$ = of(FeatureInfoActions.sendRequest({x: 1000, y: 2000, scale: 1000}));

      let actualAction: Action | undefined;
      effects.recenterSelectionOnMapClick$.subscribe((action) => (actualAction = action));

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

      actions$ = of(FeatureInfoActions.sendRequest({x: 1000, y: 2000, scale: 1000}));

      vi.useFakeTimers();
      let actualAction;
      effects.recenterSelectionOnMapClick$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();
      vi.useRealTimers();

      expect(actualAction).toBeUndefined();
    });
  });

  describe('restartSelectionOnModeChange$', () => {
    it('clears the area and hands over the circle tool for the umkreis mode', () => {
      actions$ = of(StatisticsActions.setMode({mode: 'umkreis'}));

      const actualActions: Action[] = [];
      effects.restartSelectionOnModeChange$.subscribe((action) => actualActions.push(action));

      expect(actualActions).toEqual([StatisticsActions.clearContent(), ToolActions.activateTool({tool: 'select-statistics-circle'})]);
    });

    it('clears the area and hands over the polygon tool for the polygon mode', () => {
      actions$ = of(StatisticsActions.setMode({mode: 'polygon'}));

      const actualActions: Action[] = [];
      effects.restartSelectionOnModeChange$.subscribe((action) => actualActions.push(action));

      expect(actualActions).toEqual([StatisticsActions.clearContent(), ToolActions.activateTool({tool: 'select-statistics-polygon'})]);
    });
  });
});
