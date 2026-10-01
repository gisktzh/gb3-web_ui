import {TestBed} from '@angular/core/testing';
import {provideEffects} from '@ngrx/effects';
import {provideStore, Store} from '@ngrx/store';
import {EMPTY, firstValueFrom, Observable, of, Subject} from 'rxjs';
import {STATISTICS_SERVICE} from '../../../app.tokens';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {PointWithSrs, PolygonWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {FeatureInfoResponse} from '../../../shared/interfaces/feature-info.interface';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Gb3GeneralInfoService} from '../../../shared/services/apis/gb3/gb3-general-info.service';
import {createCircle, deriveBoundingBoxCenter} from '../../../shared/utils/statistics-geometry.utils';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {QueryLocationActions} from '../actions/query-location.actions';
import {QueryModeActions} from '../actions/query-mode.actions';
import {StatisticsActions} from '../actions/statistics.actions';
import {FeatureInfoEffects} from './feature-info.effects';
import {GeneralInfoEffects} from './general-info.effects';
import {StatisticsEffects} from './statistics.effects';
import {reducer as featureInfoReducer, selectQueryLocation} from '../reducers/feature-info.reducer';
import {reducer as generalInfoReducer} from '../reducers/general-info.reducer';
import {reducer as statisticsReducer, selectGeometry, selectLoadingState} from '../reducers/statistics.reducer';
import {reducer as queryLocationReducer, selectQueryPoint} from '../reducers/query-location.reducer';
import {reducer as mapConfigReducer} from '../reducers/map-config.reducer';
import {reducer as activeMapItemReducer} from '../reducers/active-map-item.reducer';
import {reducer as queryModeReducer} from '../reducers/query-mode.reducer';
import {reducer as toolReducer} from '../reducers/tool.reducer';

describe('shared feature/statistics query location', () => {
  let store: Store;
  const topics = {loadFeatureInfos: vi.fn()};
  const generalInfo = {loadGeneralInfo: vi.fn()};
  const statistics = {loadStatistics: vi.fn()};
  const drawing = {
    drawStatisticsArea: vi.fn(),
    clearStatisticsArea: vi.fn(),
    drawFeatureQueryLocation: vi.fn(),
    clearFeatureQueryLocation: vi.fn(),
  };
  const point: PointWithSrs = {type: 'Point', coordinates: [2680000, 1254000], srs: 2056};
  const polygon: PolygonWithSrs = {
    type: 'Polygon',
    srs: 2056,
    coordinates: [
      [
        [2680000, 1254000],
        [2680111, 1254000],
        [2680090, 1254080],
        [2680000, 1254000],
      ],
    ],
  };

  beforeEach(() => {
    topics.loadFeatureInfos.mockReturnValue(of([]));
    generalInfo.loadGeneralInfo.mockReturnValue(EMPTY);
    statistics.loadStatistics.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          featureInfo: featureInfoReducer,
          generalInfo: generalInfoReducer,
          statistics: statisticsReducer,
          queryLocation: queryLocationReducer,
          mapConfig: mapConfigReducer,
          activeMapItem: activeMapItemReducer,
          queryMode: queryModeReducer,
          tool: toolReducer,
        }),
        {provide: Gb3TopicsService, useValue: topics},
        {provide: Gb3GeneralInfoService, useValue: generalInfo},
        {provide: STATISTICS_SERVICE, useValue: statistics},
        {provide: MapDrawingService, useValue: drawing},
        provideEffects(FeatureInfoEffects, GeneralInfoEffects, StatisticsEffects),
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(MapConfigActions.setScale({scale: 1000}));
    const item = createGb2WmsMapItemMock('StatBeschaeftigteZH', 1);
    Object.assign(item.settings.layers[0], {layer: 'stat-ent-p', queryable: true, minScale: 1, maxScale: 1000000});
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: item, position: 0}));
  });

  it('uses a map click as the shared point and derives a circle without duplicate feature requests', async () => {
    store.dispatch(MapConfigActions.handleMapClick({x: point.coordinates[0], y: point.coordinates[1], scale: 1000}));
    expect(await firstValueFrom(store.select(selectQueryPoint))).toEqual(point);
    const geometry = await firstValueFrom(store.select(selectGeometry));
    expect(deriveBoundingBoxCenter(geometry!)).toEqual(point);
    expect(await firstValueFrom(store.select(selectQueryLocation))).toEqual({x: point.coordinates[0], y: point.coordinates[1]});
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
    expect(generalInfo.loadGeneralInfo).toHaveBeenCalledExactlyOnceWith(point.coordinates[0], point.coordinates[1], 1000);
    expect(statistics.loadStatistics).not.toHaveBeenCalled();
    expect(drawing.drawFeatureQueryLocation).toHaveBeenCalledExactlyOnceWith(point);
  });

  it('updates feature and general info at a drawn polygon midpoint without replacing the polygon', async () => {
    store.dispatch(StatisticsActions.setMode({mode: 'polygon'}));
    store.dispatch(StatisticsActions.setSelection({geometry: polygon, radiusInMeters: undefined}));
    const midpoint = deriveBoundingBoxCenter(polygon)!;
    expect(await firstValueFrom(store.select(selectQueryPoint))).toEqual(midpoint);
    expect(await firstValueFrom(store.select(selectGeometry))).toEqual(polygon);
    expect(await firstValueFrom(store.select(selectQueryLocation))).toEqual({x: midpoint.coordinates[0], y: midpoint.coordinates[1]});
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
    expect(generalInfo.loadGeneralInfo).toHaveBeenCalledExactlyOnceWith(midpoint.coordinates[0], midpoint.coordinates[1], 1000);
  });

  it('translates a polygon without changing its shape when the feature point moves', async () => {
    store.dispatch(StatisticsActions.setMode({mode: 'polygon'}));
    store.dispatch(StatisticsActions.setSelection({geometry: polygon, radiusInMeters: undefined}));
    const originalMidpoint = deriveBoundingBoxCenter(polygon)!;
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    const moved = await firstValueFrom(store.select(selectGeometry));
    expect(deriveBoundingBoxCenter(moved!)).toEqual(point);
    expect(moved).toEqual({
      ...polygon,
      coordinates: polygon.coordinates.map((ring) =>
        ring.map(([x, y]) => [
          x + point.coordinates[0] - originalMidpoint.coordinates[0],
          y + point.coordinates[1] - originalMidpoint.coordinates[1],
        ]),
      ),
    });
    expect(topics.loadFeatureInfos).toHaveBeenCalledTimes(2);
  });

  it('changes the radius without moving the feature point or querying it again', async () => {
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(StatisticsActions.setRadius({radiusInMeters: 750}));
    expect(await firstValueFrom(store.select(selectQueryPoint))).toEqual(point);
    expect(deriveBoundingBoxCenter((await firstValueFrom(store.select(selectGeometry)))!)).toEqual(point);
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
  });

  it('keeps a freely drawn circle unchanged when synchronizing its midpoint', async () => {
    store.dispatch(StatisticsActions.setSelection({geometry: polygon, radiusInMeters: 60}));
    expect(await firstValueFrom(store.select(selectGeometry))).toEqual(polygon);
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
  });

  it('preserves a drawn circle rather than rebuilding it from the rounded radius input on point movement', async () => {
    const circle = createCircle(point, 750.25);
    store.dispatch(StatisticsActions.setSelection({geometry: circle, radiusInMeters: 750}));
    store.dispatch(QueryLocationActions.setPoint({point: {...point, coordinates: [2680100, 1254100]}, scale: 1000}));
    const moved = await firstValueFrom(store.select(selectGeometry));
    expect(moved).toEqual({
      ...circle,
      coordinates: circle.coordinates.map((ring) => ring.map(([x, y]) => [x + 100, y + 100])),
    });
    expect(topics.loadFeatureInfos).toHaveBeenCalledTimes(2);
  });

  it('invalidates statistics while inactive and reloads when the tab opens', async () => {
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    expect(statistics.loadStatistics).toHaveBeenCalledOnce();
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    store.dispatch(StatisticsActions.setRadius({radiusInMeters: 750}));
    expect(await firstValueFrom(store.select(selectLoadingState))).toBeUndefined();
    expect(statistics.loadStatistics).toHaveBeenCalledOnce();
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    expect(statistics.loadStatistics).toHaveBeenCalledTimes(2);
  });

  it('preserves the query point when resetting the selection mode, and clears it on overlay closure', async () => {
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(StatisticsActions.setMode({mode: 'polygon'}));
    expect(await firstValueFrom(store.select(selectQueryPoint))).toEqual(point);
    expect(await firstValueFrom(store.select(selectGeometry))).toBeUndefined();
    store.dispatch(MapConfigActions.clearFeatureInfoContent());
    expect(await firstValueFrom(store.select(selectQueryPoint))).toBeUndefined();
    expect(await firstValueFrom(store.select(selectQueryLocation))).toEqual({});
  });

  it('cancels feature requests on point changes and closure so stale responses cannot repopulate data', () => {
    const first = new Subject<FeatureInfoResponse[]>();
    const cancelFirst = vi.fn();
    topics.loadFeatureInfos.mockReturnValueOnce(
      new Observable<FeatureInfoResponse[]>((subscriber) => {
        const subscription = first.subscribe(subscriber);
        return () => {
          cancelFirst();
          subscription.unsubscribe();
        };
      }),
    );
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(QueryLocationActions.setPoint({point: {...point, coordinates: [2680010, 1254010]}, scale: 1000}));
    expect(cancelFirst).toHaveBeenCalledOnce();
    const cancelSecond = vi.fn();
    topics.loadFeatureInfos.mockReturnValueOnce(new Observable(() => cancelSecond));
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(MapConfigActions.clearFeatureInfoContent());
    expect(cancelSecond).toHaveBeenCalledOnce();
  });

  it('retains an oversized selection and updates feature info without sending a statistics request', async () => {
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    const large: PolygonWithSrs = {
      ...polygon,
      coordinates: [
        [
          [2680000, 1254000],
          [2687000, 1254000],
          [2687000, 1261000],
          [2680000, 1261000],
          [2680000, 1254000],
        ],
      ],
    };
    store.dispatch(StatisticsActions.setSelection({geometry: large, radiusInMeters: undefined}));
    expect(await firstValueFrom(store.select(selectGeometry))).toEqual(large);
    expect(await firstValueFrom(store.select(selectQueryPoint))).toEqual(deriveBoundingBoxCenter(large));
    expect(statistics.loadStatistics).not.toHaveBeenCalled();
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
  });

  it('clears results when eligible layers are hidden and reloads when they become visible again', () => {
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    expect(statistics.loadStatistics).toHaveBeenCalledOnce();
    const item = createGb2WmsMapItemMock('StatBeschaeftigteZH');
    store.dispatch(ActiveMapItemActions.setVisibility({activeMapItem: item, visible: false}));
    expect(statistics.loadStatistics).toHaveBeenCalledOnce();
    store.dispatch(ActiveMapItemActions.setVisibility({activeMapItem: item, visible: true}));
    expect(statistics.loadStatistics).toHaveBeenCalledTimes(2);
    store.dispatch(MapConfigActions.setScale({scale: 1_000_001}));
    expect(statistics.loadStatistics).toHaveBeenCalledTimes(2);
  });
});
