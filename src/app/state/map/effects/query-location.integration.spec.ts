import {TestBed} from '@angular/core/testing';
import {EffectSources, provideEffects} from '@ngrx/effects';
import {provideStore, Store} from '@ngrx/store';
import {EMPTY, firstValueFrom, Observable, of, Subject} from 'rxjs';
import {DRAWING_SYMBOLS_SERVICE, MAP_SERVICE, STATISTICS_SERVICE} from '../../../app.tokens';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {PointWithSrs, PolygonWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {FeatureInfoResponse} from '../../../shared/interfaces/feature-info.interface';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Gb3GeneralInfoService} from '../../../shared/services/apis/gb3/gb3-general-info.service';
import {Gb3OerebExtractService} from '../../../shared/services/apis/gb3/gb3-oereb-extract.service';
import {OerebExtractResponse} from '../../../shared/interfaces/oereb-extract.interface';
import {statisticsMapQueries} from '../../../shared/configs/statistics.config';
import {StatisticsResult} from '../../../shared/interfaces/statistics.interface';
import {createCircle, deriveBoundingBoxCenter} from '../../../shared/utils/statistics-geometry.utils';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {QueryLocationActions} from '../actions/query-location.actions';
import {QueryModeActions} from '../actions/query-mode.actions';
import {StatisticsActions} from '../actions/statistics.actions';
import {FeatureInfoEffects} from './feature-info.effects';
import {GeneralInfoEffects} from './general-info.effects';
import {OerebExtractEffects} from './oereb-extract.effects';
import {StatisticsEffects} from './statistics.effects';
import {
  reducer as featureInfoReducer,
  selectData as selectFeatureInfoData,
  selectLoadingState as selectFeatureInfoLoadingState,
  selectFeatureInfoState,
  selectQueryLocation,
} from '../reducers/feature-info.reducer';
import {reducer as generalInfoReducer, selectGeneralInfoState} from '../reducers/general-info.reducer';
import {
  reducer as oerebExtractReducer,
  selectData as selectOerebExtractData,
  selectOerebExtractState,
} from '../reducers/oereb-extract.reducer';
import {reducer as statisticsReducer, selectGeometry, selectLoadingState} from '../reducers/statistics.reducer';
import {reducer as queryLocationReducer, selectQueryPoint} from '../reducers/query-location.reducer';
import {reducer as mapConfigReducer} from '../reducers/map-config.reducer';
import {reducer as activeMapItemReducer} from '../reducers/active-map-item.reducer';
import {reducer as queryModeReducer, selectQueryMode} from '../reducers/query-mode.reducer';
import {reducer as toolReducer} from '../reducers/tool.reducer';
import {reducer as mapUiReducer, selectIsFeatureInfoOverlayVisible, selectToolMenuVisibility} from '../reducers/map-ui.reducer';
import {reducer as appLayoutReducer} from '../../app/reducers/app-layout.reducer';
import {QueryModeEffects} from './query-mode.effects';
import {ToolEffects} from './tool.effects';
import {MapUiEffects} from './map-ui.effects';
import {MatDialog} from '@angular/material/dialog';
import {DrawingSymbolServiceStub} from '../../../testing/map-testing/drawing-symbol-service.stub';
import {GeneralInfoResponse} from '../../../shared/interfaces/general-info.interface';
import {selectFeatureInfoQueryLoadingState} from '../selectors/feature-info-query-loading-state.selector';
import {FeatureHighlightingService} from '../../../map/services/feature-highlighting.service';
import {ToolActions} from '../actions/tool.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {selectActiveTool} from '../reducers/tool.reducer';
import {selectItems} from '../selectors/active-map-items.selector';
import {selectIsStatisticsAvailable} from '../selectors/statistics-availability.selector';
import {ToolType} from '../../../shared/types/tool.type';
import {TimeSliderConfiguration} from '../../../shared/interfaces/topic.interface';
import {ActiveMapItemEffects} from './active-map-item.effects';
import {TimeSliderService} from '../../../map/services/time-slider.service';

describe('shared feature/statistics query location', () => {
  let store: Store;
  const topics = {loadFeatureInfos: vi.fn()};
  const generalInfo = {loadGeneralInfo: vi.fn()};
  const oerebExtract = {loadOerebExtract: vi.fn()};
  const statistics = {loadStatistics: vi.fn()};
  const drawing = {
    drawStatisticsArea: vi.fn(),
    clearStatisticsArea: vi.fn(),
    drawFeatureQueryLocation: vi.fn(),
    clearFeatureQueryLocation: vi.fn(),
    drawStatisticsHighlights: vi.fn(),
    clearStatisticsHighlights: vi.fn(),
    drawFeatureInfoHighlight: vi.fn(),
    clearFeatureInfoHighlight: vi.fn(),
  };
  const tools = {initializeStatisticsSelection: vi.fn(), initializeMeasurement: vi.fn(), cancelTool: vi.fn()};
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
  const additionalItem = () => {
    const item = createGb2WmsMapItemMock('AdditionalTopic', 1);
    Object.assign(item.settings.layers[0], {queryable: true, minScale: 1, maxScale: 1000000});
    return item;
  };
  const featureInfo = (topic: string): FeatureInfoResponse => ({
    featureInfo: {
      x: point.coordinates[0],
      y: point.coordinates[1],
      results: {topic, layers: [], isSingleLayer: false, report: {url: null, description: null}},
    },
  });
  const extract: OerebExtractResponse = {
    municipalityName: 'Zürich',
    municipalityCode: 261,
    parcelNumber: '1234',
    completeness: 'vollständig',
    area: 100,
    statusOfficialSurvey: '2026-01-01',
    egrid: 'CH1234',
    kbo: {title: 'KBO'},
    surveyor: {title: 'Vermessung'},
    staticExtractUrl: 'https://example.com/extract.pdf',
    concernedThemes: [],
    notConcernedThemes: [],
    notAvailableThemes: [],
  };
  const oerebItem = () => {
    const item = createGb2WmsMapItemMock('KatOerebRaumplanungZH', 1);
    Object.assign(item.settings.layers[0], {queryable: true, minScale: 1, maxScale: 1000000});
    return item;
  };
  const initialTimeExtent = {start: new Date('2025-01-01'), end: new Date('2025-12-31')};
  const changedTimeExtent = {start: new Date('2026-01-01'), end: new Date('2026-12-31')};
  const configuredItem = () => {
    const item = additionalItem();
    Object.assign(item.settings, {
      filterConfigurations: [
        {name: 'Kategorie', parameter: 'FILTER_CATEGORY', filterValues: [{name: 'A', values: ['A'], isActive: false}]},
      ],
      timeSliderExtent: initialTimeExtent,
      timeSliderConfiguration: {
        name: 'Jahr',
        dateFormat: 'YYYY',
        minimumDate: '2025',
        maximumDate: '2026',
        alwaysMaxRange: false,
        sourceType: 'parameter',
        source: {startRangeParameter: 'FILTER_FROM', endRangeParameter: 'FILTER_TO', layerIdentifiers: [item.settings.layers[0].layer]},
      } satisfies TimeSliderConfiguration,
    });
    return item;
  };
  const statisticsResults: StatisticsResult[] = [
    {
      topic: 'StatBeschaeftigteZH',
      title: 'Beschäftigte',
      layers: [{layer: 'stat-ent-p', title: 'Beschäftigte', columns: ['Summe'], rows: [], status: 'ok', featureGeometry: point}],
    },
  ];

  beforeEach(() => {
    topics.loadFeatureInfos.mockReturnValue(of([]));
    generalInfo.loadGeneralInfo.mockImplementation((x: number, y: number) =>
      of({
        locationInformation: {queryPosition: {type: 'Point', coordinates: [x, y], srs: 2056}, heightDom: 410, heightDtm: 400},
        alternativeSpatialReferences: [],
        externalMaps: [],
      } satisfies GeneralInfoResponse),
    );
    oerebExtract.loadOerebExtract.mockReturnValue(of(null));
    statistics.loadStatistics.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          featureInfo: featureInfoReducer,
          generalInfo: generalInfoReducer,
          oerebExtract: oerebExtractReducer,
          statistics: statisticsReducer,
          queryLocation: queryLocationReducer,
          mapConfig: mapConfigReducer,
          activeMapItem: activeMapItemReducer,
          queryMode: queryModeReducer,
          tool: toolReducer,
          mapUi: mapUiReducer,
          appLayout: appLayoutReducer,
        }),
        {provide: Gb3TopicsService, useValue: topics},
        {provide: Gb3GeneralInfoService, useValue: generalInfo},
        {provide: Gb3OerebExtractService, useValue: oerebExtract},
        {provide: STATISTICS_SERVICE, useValue: statistics},
        {provide: MapDrawingService, useValue: drawing},
        {provide: MAP_SERVICE, useValue: {getToolService: () => tools}},
        {provide: MatDialog, useValue: {open: vi.fn()}},
        {provide: DRAWING_SYMBOLS_SERVICE, useClass: DrawingSymbolServiceStub},
        FeatureHighlightingService,
        ActiveMapItemEffects,
        {provide: TimeSliderService, useValue: {isLayerVisible: () => undefined}},
        provideEffects(
          FeatureInfoEffects,
          GeneralInfoEffects,
          OerebExtractEffects,
          StatisticsEffects,
          QueryModeEffects,
          ToolEffects,
          MapUiEffects,
        ),
      ],
    });
    store = TestBed.inject(Store);
    const mapItemEffects = TestBed.inject(ActiveMapItemEffects);
    // Include the layer state effects without creating or updating live map layers.
    TestBed.inject(EffectSources).addEffects({
      setTimeSliderExtent$: mapItemEffects.setTimeSliderExtent$,
      clearFeatureInfoContentAfterRemovingAllMapItems$: mapItemEffects.clearFeatureInfoContentAfterRemovingAllMapItems$,
    });
    TestBed.inject(FeatureHighlightingService).init();
    store.dispatch(MapConfigActions.setScale({scale: 1000}));
    const item = createGb2WmsMapItemMock('StatBeschaeftigteZH', 1);
    Object.assign(item.settings.layers[0], {layer: 'stat-ent-p', queryable: true, minScale: 1, maxScale: 1000000});
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: item, position: 0}));
  });

  it.each<ToolType | undefined>([undefined, 'select-statistics-circle', 'select-statistics-polygon'])(
    'returns to feature mode and releases %s after removing the last supported layer',
    async (tool) => {
      store.dispatch(MapConfigActions.markMapServiceAsInitialized());
      store.dispatch(MapConfigActions.setReady({calculatedMinScale: 1_000_000, calculatedMaxScale: 1}));
      store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: additionalItem(), position: 1}));
      store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
      statistics.loadStatistics.mockReturnValue(of(statisticsResults));
      store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
      expect(await firstValueFrom(store.select(selectLoadingState))).toBe('loaded');
      store.dispatch(StatisticsActions.highlightLayer({topic: 'StatBeschaeftigteZH', layer: 'stat-ent-p'}));
      if (tool) store.dispatch(ToolActions.activateTool({tool}));
      const item = (await firstValueFrom(store.select(selectItems)))[0];
      tools.cancelTool.mockClear();
      drawing.clearStatisticsArea.mockClear();
      drawing.clearStatisticsHighlights.mockClear();
      store.dispatch(ActiveMapItemActions.removeActiveMapItem({activeMapItem: item}));
      expect(await firstValueFrom(store.select(selectIsStatisticsAvailable))).toBe(false);
      expect(await firstValueFrom(store.select(selectQueryMode))).toBe('feature');
      expect(await firstValueFrom(store.select(selectToolMenuVisibility))).toBe('feature');
      expect(await firstValueFrom(store.select(selectActiveTool))).toBeUndefined();
      expect(tools.cancelTool).toHaveBeenCalledTimes(tool ? 1 : 0);
      expect(drawing.clearStatisticsArea).toHaveBeenCalled();
      expect(drawing.clearStatisticsHighlights).toHaveBeenCalled();
      expect(await firstValueFrom(store.select(selectQueryPoint))).toEqual(point);
      expect(await firstValueFrom(store.select(selectIsFeatureInfoOverlayVisible))).toBe(true);
      expect(statistics.loadStatistics).toHaveBeenCalledOnce();
      store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: item, position: 0}));
      expect(await firstValueFrom(store.select(selectIsStatisticsAvailable))).toBe(true);
      expect(await firstValueFrom(store.select(selectQueryMode))).toBe('feature');
    },
  );

  it('keeps statistics active for hidden layers and when another supported layer remains', async () => {
    const item = (await firstValueFrom(store.select(selectItems)))[0];
    const second = createGb2WmsMapItemMock('StatBevoelkerungZH', 1);
    second.settings.layers[0].layer = 'stat-bev-p';
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: second, position: 1}));
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
    store.dispatch(ActiveMapItemActions.setVisibility({activeMapItem: second, visible: false}));
    store.dispatch(ActiveMapItemActions.removeActiveMapItem({activeMapItem: item}));
    expect(await firstValueFrom(store.select(selectIsStatisticsAvailable))).toBe(true);
    expect(await firstValueFrom(store.select(selectQueryMode))).toBe('statistics');
    expect(await firstValueFrom(store.select(selectToolMenuVisibility))).toBe('statistics');
    store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
    expect(await firstValueFrom(store.select(selectQueryMode))).toBe('feature');
    expect(await firstValueFrom(store.select(selectToolMenuVisibility))).toBe('feature');
  });

  it('rejects unavailable mode and menu activation without opening or querying statistics', async () => {
    store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    store.dispatch(MapUiActions.toggleToolMenu({tool: 'statistics'}));
    expect(await firstValueFrom(store.select(selectQueryMode))).toBe('feature');
    expect(await firstValueFrom(store.select(selectToolMenuVisibility))).toBe('feature');
    expect(statistics.loadStatistics).not.toHaveBeenCalled();
  });

  it('preserves other tools when statistics layers disappear in feature mode', async () => {
    store.dispatch(MapUiActions.toggleToolMenu({tool: 'measurement'}));
    store.dispatch(ToolActions.activateTool({tool: 'measure-line'}));
    store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
    expect(await firstValueFrom(store.select(selectQueryMode))).toBe('feature');
    expect(await firstValueFrom(store.select(selectToolMenuVisibility))).toBe('measurement');
    expect(await firstValueFrom(store.select(selectActiveTool))).toBe('measure-line');
    expect(tools.cancelTool).not.toHaveBeenCalled();
  });

  it('loads complete feature results, hands off measurement, and restores the retained selection after map recreation', async () => {
    store.dispatch(MapConfigActions.markMapServiceAsInitialized());
    store.dispatch(MapConfigActions.setReady({calculatedMinScale: 1_000_000, calculatedMaxScale: 1}));
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    expect(await firstValueFrom(store.select(selectFeatureInfoQueryLoadingState))).toBe('loaded');
    store.dispatch(MapUiActions.toggleToolMenu({tool: 'measurement'}));
    store.dispatch(ToolActions.activateTool({tool: 'measure-line'}));
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
    expect(await firstValueFrom(store.select(selectActiveTool))).toBeUndefined();
    expect(tools.cancelTool).toHaveBeenCalledOnce();
    expect(await firstValueFrom(store.select(selectIsFeatureInfoOverlayVisible))).toBe(true);
    const geometry = await firstValueFrom(store.select(selectGeometry));
    expect(drawing.drawStatisticsArea).toHaveBeenLastCalledWith(geometry);
    drawing.drawStatisticsArea.mockClear();
    store.dispatch(MapConfigActions.markMapServiceAsDeinitialized());
    expect(drawing.drawStatisticsArea).not.toHaveBeenCalled();
    store.dispatch(MapConfigActions.markMapServiceAsInitialized());
    expect(drawing.drawStatisticsArea).toHaveBeenCalledExactlyOnceWith(geometry);
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'feature'}));
    expect(drawing.clearStatisticsArea).toHaveBeenCalled();
    expect(await firstValueFrom(store.select(selectFeatureInfoQueryLoadingState))).toBe('loaded');
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
  });

  it('scopes feature pins to their mode, restores them, and clears all graphics on real overlay closure', () => {
    store.dispatch(MapConfigActions.markMapServiceAsInitialized());
    store.dispatch(MapConfigActions.setReady({calculatedMinScale: 1_000_000, calculatedMaxScale: 1}));
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(FeatureInfoActions.highlightFeature({feature: point, pinnedFeatureId: 'topic_layer_1'}));
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenLastCalledWith(point);
    drawing.drawFeatureInfoHighlight.mockClear();
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
    expect(drawing.clearFeatureInfoHighlight).toHaveBeenCalled();
    expect(drawing.drawFeatureInfoHighlight).not.toHaveBeenCalled();
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'feature'}));
    expect(drawing.drawFeatureInfoHighlight).toHaveBeenCalledExactlyOnceWith(point);
    store.dispatch(MapUiActions.setFeatureInfoVisibility({isVisible: false}));
    expect(drawing.clearFeatureInfoHighlight).toHaveBeenCalled();
    expect(drawing.clearStatisticsArea).toHaveBeenCalled();
    expect(drawing.clearFeatureQueryLocation).toHaveBeenCalled();
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

  it('retains feature results after adding a map in statistics and queries both maps on the next click', async () => {
    const first = featureInfo('StatBeschaeftigteZH');
    const second = featureInfo('AdditionalTopic');
    topics.loadFeatureInfos.mockReturnValueOnce(of([first])).mockReturnValueOnce(of([first, second]));
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    expect(await firstValueFrom(store.select(selectFeatureInfoData))).toEqual([first.featureInfo.results]);
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    const item = additionalItem();
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: item, position: 1}));
    expect(await firstValueFrom(store.select(selectFeatureInfoData))).toEqual([first.featureInfo.results]);
    expect(await firstValueFrom(store.select(selectFeatureInfoLoadingState))).toBe('loaded');
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();

    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
    store.dispatch(MapConfigActions.handleMapClick({x: point.coordinates[0], y: point.coordinates[1], scale: 1000}));
    expect(topics.loadFeatureInfos).toHaveBeenLastCalledWith(point.coordinates[0], point.coordinates[1], 1000, [
      expect.objectContaining({topic: 'StatBeschaeftigteZH', layersToQuery: 'stat-ent-p'}),
      expect.objectContaining({topic: 'AdditionalTopic', layersToQuery: item.settings.layers[0].layer}),
    ]);
    expect(topics.loadFeatureInfos).toHaveBeenCalledTimes(2);
    expect(await firstValueFrom(store.select(selectFeatureInfoData))).toEqual([first.featureInfo.results, second.featureInfo.results]);
    expect(await firstValueFrom(store.select(selectQueryPoint))).toEqual(point);
    expect(generalInfo.loadGeneralInfo).toHaveBeenCalledTimes(2);
  });

  it('does not query when a queryable map is added while features are active', () => {
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: additionalItem(), position: 1}));
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
    expect(topics.loadFeatureInfos).toHaveBeenLastCalledWith(point.coordinates[0], point.coordinates[1], 1000, expect.any(Array));
  });

  it('does not requery when switching tabs without changing the feature query', () => {
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
  });

  it('requests a newly added ÖREB map only on the next explicit query', () => {
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    expect(oerebExtract.loadOerebExtract).not.toHaveBeenCalled();
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    const item = oerebItem();
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: item, position: 1}));
    expect(oerebExtract.loadOerebExtract).not.toHaveBeenCalled();
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    expect(oerebExtract.loadOerebExtract).not.toHaveBeenCalled();
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    expect(oerebExtract.loadOerebExtract).toHaveBeenCalledExactlyOnceWith(point.coordinates[0], point.coordinates[1]);
  });

  it('retains a pending ÖREB extract after removing its map until the next explicit query', async () => {
    const item = oerebItem();
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: item, position: 1}));
    const pending = new Subject<OerebExtractResponse>();
    const cancel = vi.fn();
    oerebExtract.loadOerebExtract.mockReturnValueOnce(
      new Observable<OerebExtractResponse>((subscriber) => {
        const subscription = pending.subscribe(subscriber);
        return () => {
          cancel();
          subscription.unsubscribe();
        };
      }),
    );
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    store.dispatch(ActiveMapItemActions.removeActiveMapItem({activeMapItem: item}));
    expect(cancel).not.toHaveBeenCalled();
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    pending.next(extract);
    expect(await firstValueFrom(store.select(selectOerebExtractData))).toEqual(extract);
    expect(oerebExtract.loadOerebExtract).toHaveBeenCalledOnce();
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    expect(cancel).toHaveBeenCalledOnce();
    expect(await firstValueFrom(store.select(selectOerebExtractData))).toBeNull();
    expect(oerebExtract.loadOerebExtract).toHaveBeenCalledOnce();
  });

  it('does not query after layer changes without a retained point or after overlay closure', () => {
    const item = additionalItem();
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: item, position: 1}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    expect(topics.loadFeatureInfos).not.toHaveBeenCalled();
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(MapConfigActions.clearFeatureInfoContent());
    store.dispatch(ActiveMapItemActions.setVisibility({activeMapItem: item, visible: false}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
  });

  describe.each(['loaded', 'pending'] as const)('%s feature queries', (status) => {
    it.each(['feature', 'statistics'] as const)(
      'retains feature, general and ÖREB queries through map configuration and tab changes while %s is active',
      async (queryMode) => {
        const item = configuredItem();
        const oereb = oerebItem();
        const added = createGb2WmsMapItemMock('NewTopic', 1);
        Object.assign(added.settings.layers[0], {queryable: true, minScale: 1, maxScale: 1000000});
        store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: item, position: 1}));
        store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: oereb, position: 2}));
        const results = [featureInfo('StatBeschaeftigteZH'), featureInfo('AdditionalTopic')];
        const general: GeneralInfoResponse = {
          locationInformation: {queryPosition: point, heightDom: 410, heightDtm: 400},
          alternativeSpatialReferences: [],
          externalMaps: [],
        };
        const pendingFeatures = new Subject<FeatureInfoResponse[]>();
        const pendingGeneral = new Subject<GeneralInfoResponse>();
        const pendingExtract = new Subject<OerebExtractResponse>();
        const cancelFeatures = vi.fn();
        const cancelGeneral = vi.fn();
        const cancelExtract = vi.fn();
        const tracked = <T>(source: Subject<T>, cancel: () => void) =>
          new Observable<T>((subscriber) => {
            const subscription = source.subscribe(subscriber);
            return () => {
              cancel();
              subscription.unsubscribe();
            };
          });
        topics.loadFeatureInfos.mockReturnValueOnce(status === 'loaded' ? of(results) : tracked(pendingFeatures, cancelFeatures));
        generalInfo.loadGeneralInfo.mockReturnValueOnce(status === 'loaded' ? of(general) : tracked(pendingGeneral, cancelGeneral));
        oerebExtract.loadOerebExtract.mockReturnValueOnce(status === 'loaded' ? of(extract) : tracked(pendingExtract, cancelExtract));
        store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
        store.dispatch(FeatureInfoActions.highlightFeature({feature: point, pinnedFeatureId: 'topic_layer_1'}));
        store.dispatch(QueryModeActions.setQueryMode({queryMode}));
        const featureState = await firstValueFrom(store.select(selectFeatureInfoState));
        const generalState = await firstValueFrom(store.select(selectGeneralInfoState));
        const extractState = await firstValueFrom(store.select(selectOerebExtractState));
        const changes = [
          MapConfigActions.setScale({scale: 1_000_001}),
          MapConfigActions.setMapExtent({x: point.coordinates[0] + 100, y: point.coordinates[1] + 100, scale: 2000}),
          ActiveMapItemActions.setOpacity({activeMapItem: item, opacity: 0.5}),
          ActiveMapItemActions.setLoadingState({id: item.id, loadingState: 'loaded'}),
          ActiveMapItemActions.setSublayerVisibility({activeMapItem: item, layerId: item.settings.layers[0].id, visible: false}),
          ActiveMapItemActions.setSublayerVisibility({activeMapItem: item, layerId: item.settings.layers[0].id, visible: true}),
          ActiveMapItemActions.setVisibility({activeMapItem: item, visible: false}),
          ActiveMapItemActions.setVisibility({activeMapItem: item, visible: true}),
          ActiveMapItemActions.setAttributeFilterValueState({
            activeMapItem: item,
            attributeFilterParameter: 'FILTER_CATEGORY',
            filterValueName: 'A',
            isFilterValueActive: true,
          }),
          ActiveMapItemActions.setTimeSliderExtent({activeMapItem: item, timeExtent: changedTimeExtent}),
          ActiveMapItemActions.addActiveMapItem({activeMapItem: added, position: 3}),
          ActiveMapItemActions.removeActiveMapItem({activeMapItem: added}),
          ActiveMapItemActions.removeActiveMapItem({activeMapItem: oereb}),
          QueryModeActions.setQueryMode({queryMode: 'statistics'}),
          QueryModeActions.setQueryMode({queryMode: 'feature'}),
        ];
        for (const action of changes) {
          store.dispatch(action);
          expect(await firstValueFrom(store.select(selectFeatureInfoState)), action.type).toEqual(featureState);
          expect(await firstValueFrom(store.select(selectGeneralInfoState)), action.type).toEqual(generalState);
          expect(await firstValueFrom(store.select(selectOerebExtractState)), action.type).toEqual(extractState);
          expect(topics.loadFeatureInfos, action.type).toHaveBeenCalledOnce();
          expect(generalInfo.loadGeneralInfo, action.type).toHaveBeenCalledOnce();
          expect(oerebExtract.loadOerebExtract, action.type).toHaveBeenCalledOnce();
          expect(cancelFeatures, action.type).not.toHaveBeenCalled();
          expect(cancelGeneral, action.type).not.toHaveBeenCalled();
          expect(cancelExtract, action.type).not.toHaveBeenCalled();
        }
        if (status === 'pending') {
          pendingFeatures.next(results);
          pendingGeneral.next(general);
          pendingExtract.next(extract);
        }
        expect(await firstValueFrom(store.select(selectFeatureInfoData))).toEqual(results.map((result) => result.featureInfo.results));
        expect(await firstValueFrom(store.select(selectOerebExtractData))).toEqual(extract);
        expect(await firstValueFrom(store.select(selectFeatureInfoQueryLoadingState))).toBe('loaded');
      },
    );
  });

  it('uses current scale, visibility, filters and time extent on the next explicit query', async () => {
    const item = configuredItem();
    item.settings.layers.push({...item.settings.layers[0], id: 1, layer: 'new-scale-layer', minScale: 1500});
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: item, position: 1}));
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    const initialLayers = topics.loadFeatureInfos.mock.calls[0][3];
    expect(initialLayers).toEqual([
      expect.objectContaining({topic: 'StatBeschaeftigteZH', layersToQuery: 'stat-ent-p'}),
      expect.objectContaining({
        topic: 'AdditionalTopic',
        layersToQuery: item.settings.layers[0].layer,
        timeSliderExtent: initialTimeExtent,
      }),
    ]);
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    store.dispatch(MapConfigActions.setScale({scale: 2000}));
    store.dispatch(ActiveMapItemActions.setSublayerVisibility({activeMapItem: item, layerId: 0, visible: false}));
    store.dispatch(
      ActiveMapItemActions.setAttributeFilterValueState({
        activeMapItem: item,
        attributeFilterParameter: 'FILTER_CATEGORY',
        filterValueName: 'A',
        isFilterValueActive: true,
      }),
    );
    store.dispatch(ActiveMapItemActions.setTimeSliderExtent({activeMapItem: item, timeExtent: changedTimeExtent}));
    const original = (await firstValueFrom(store.select(selectItems)))[0];
    store.dispatch(ActiveMapItemActions.setVisibility({activeMapItem: original, visible: false}));
    const oereb = oerebItem();
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: oereb, position: 2}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
    expect(generalInfo.loadGeneralInfo).toHaveBeenCalledOnce();
    expect(oerebExtract.loadOerebExtract).not.toHaveBeenCalled();

    const x = point.coordinates[0] + 100;
    const y = point.coordinates[1] + 100;
    store.dispatch(MapConfigActions.handleMapClick({x, y, scale: 2000}));
    expect(topics.loadFeatureInfos).toHaveBeenCalledTimes(2);
    expect(topics.loadFeatureInfos).toHaveBeenLastCalledWith(x, y, 2000, [
      expect.objectContaining({
        topic: 'AdditionalTopic',
        layersToQuery: 'new-scale-layer',
        filterConfigurations: [
          {name: 'Kategorie', parameter: 'FILTER_CATEGORY', filterValues: [{name: 'A', values: ['A'], isActive: true}]},
        ],
        timeSliderExtent: changedTimeExtent,
      }),
      expect.objectContaining({topic: 'KatOerebRaumplanungZH', layersToQuery: oereb.settings.layers[0].layer}),
    ]);
    expect(generalInfo.loadGeneralInfo).toHaveBeenCalledTimes(2);
    expect(generalInfo.loadGeneralInfo).toHaveBeenLastCalledWith(x, y, 2000);
    expect(oerebExtract.loadOerebExtract).toHaveBeenCalledExactlyOnceWith(x, y);
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

  it('cancels feature requests on point changes and closure so stale responses cannot repopulate data', async () => {
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
    first.next([featureInfo('old point')]);
    expect(await firstValueFrom(store.select(selectFeatureInfoData))).toEqual([]);
    const cancelSecond = vi.fn();
    topics.loadFeatureInfos.mockReturnValueOnce(new Observable(() => cancelSecond));
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(MapConfigActions.clearFeatureInfoContent());
    expect(cancelSecond).toHaveBeenCalledOnce();
  });

  it.each(['point change', 'overlay closure'] as const)('cancels a pending ÖREB extract after %s', async (change) => {
    store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: oerebItem(), position: 1}));
    const pending = new Subject<OerebExtractResponse>();
    const cancel = vi.fn();
    oerebExtract.loadOerebExtract.mockReturnValueOnce(
      new Observable<OerebExtractResponse>((subscriber) => {
        const subscription = pending.subscribe(subscriber);
        return () => {
          cancel();
          subscription.unsubscribe();
        };
      }),
    );
    store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
    store.dispatch(
      change === 'point change'
        ? QueryLocationActions.setPoint({point: {...point, coordinates: [2680010, 1254010]}, scale: 1000})
        : MapConfigActions.clearFeatureInfoContent(),
    );
    expect(cancel).toHaveBeenCalledOnce();
    pending.next(extract);
    expect(await firstValueFrom(store.select(selectOerebExtractData))).toBeNull();
  });

  it.each(['loaded', 'pending'] as const)(
    'clears %s feature queries when all map items are removed without querying again',
    async (status) => {
      const pending = new Subject<FeatureInfoResponse[]>();
      const cancel = vi.fn();
      topics.loadFeatureInfos.mockReturnValueOnce(
        status === 'loaded'
          ? of([featureInfo('StatBeschaeftigteZH')])
          : new Observable<FeatureInfoResponse[]>((subscriber) => {
              const subscription = pending.subscribe(subscriber);
              return () => {
                cancel();
                subscription.unsubscribe();
              };
            }),
      );
      store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
      store.dispatch(FeatureInfoActions.highlightFeature({feature: point, pinnedFeatureId: 'topic_layer_1'}));
      store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
      if (status === 'pending') expect(cancel).toHaveBeenCalledOnce();
      pending.next([featureInfo('removed map')]);
      expect(await firstValueFrom(store.select(selectFeatureInfoState))).toEqual({
        data: [],
        loadingState: undefined,
        queryLocation: {},
        highlightedFeature: undefined,
        pinnedFeatureId: undefined,
      });
      store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
      store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
      expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
    },
  );

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

  describe('statistics feature marking', () => {
    beforeEach(() => {
      store.dispatch(MapConfigActions.markMapServiceAsInitialized());
      store.dispatch(MapConfigActions.setReady({calculatedMinScale: 1_000_000, calculatedMaxScale: 1}));
      statistics.loadStatistics.mockReturnValueOnce(of(statisticsResults)).mockReturnValue(EMPTY);
      store.dispatch(QueryLocationActions.setPoint({point, scale: 1000}));
      store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([]);
      store.dispatch(StatisticsActions.highlightLayer({topic: 'StatBeschaeftigteZH', layer: 'stat-ent-p'}));
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([point]);
    });

    it('hides markings on the feature tab and restores cached markings without another statistics request', () => {
      store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
      expect(drawing.clearStatisticsHighlights).toHaveBeenCalled();
      store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([point]);
      expect(statistics.loadStatistics).toHaveBeenCalledOnce();
    });

    it('renders temporary previews, clears them on mouse leave, and does not restore them after tab switches', () => {
      const layer = {topic: 'StatBeschaeftigteZH', layer: 'stat-ent-p'};
      store.dispatch(StatisticsActions.clearHighlight());
      store.dispatch(StatisticsActions.hoverLayer(layer));
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([point]);
      store.dispatch(StatisticsActions.clearHover());
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([]);
      store.dispatch(StatisticsActions.hoverLayer(layer));
      store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
      expect(drawing.clearStatisticsHighlights).toHaveBeenCalled();
      store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([]);
      expect(statistics.loadStatistics).toHaveBeenCalledOnce();
    });

    it('keeps a pinned layer marked while other layers are hovered or left', () => {
      store.dispatch(StatisticsActions.hoverLayer({topic: 'StatBevoelkerungZH', layer: 'stat-bev-p'}));
      store.dispatch(StatisticsActions.clearHover());
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([point]);
      store.dispatch(StatisticsActions.clearHighlight());
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([]);
    });

    it.each([
      {name: 'a changed selection', action: StatisticsActions.setSelection({geometry: polygon, radiusInMeters: undefined})},
      {name: 'a refreshed request', action: StatisticsActions.sendRequest()},
      {name: 'invalidated queries', action: StatisticsActions.invalidateContent()},
      {name: 'cleared statistics', action: StatisticsActions.clearContent()},
      {name: 'an API error', action: StatisticsActions.setError({error: new Error('Statistics failed')})},
      {name: 'overlay closure', action: MapConfigActions.clearFeatureInfoContent()},
      {name: 'unmarking a result', action: StatisticsActions.clearHighlight()},
    ])('removes obsolete markings after $name', ({action}) => {
      store.dispatch(action);
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([]);
    });

    it('removes markings when a supported map is hidden', () => {
      store.dispatch(
        ActiveMapItemActions.setVisibility({
          activeMapItem: createGb2WmsMapItemMock('StatBeschaeftigteZH'),
          visible: false,
        }),
      );
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([]);
    });

    it('clears old markings during radius changes and only marks features from the new response', () => {
      const pending = new Subject<StatisticsResult[]>();
      statistics.loadStatistics.mockReturnValueOnce(pending);
      store.dispatch(StatisticsActions.setRadius({radiusInMeters: 1000}));
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([]);
      pending.next(statisticsResults);
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([]);
      store.dispatch(StatisticsActions.highlightLayer({topic: 'StatBeschaeftigteZH', layer: 'stat-ent-p'}));
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([point]);
    });

    it('does not mark refreshed results automatically, including a response received while features are active', () => {
      const pending = new Subject<StatisticsResult[]>();
      statistics.loadStatistics.mockReturnValueOnce(pending);
      store.dispatch(StatisticsActions.sendRequest());
      store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
      drawing.drawStatisticsHighlights.mockClear();
      pending.next(statisticsResults);
      expect(drawing.drawStatisticsHighlights).not.toHaveBeenCalled();
      store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([]);
      store.dispatch(StatisticsActions.highlightLayer({topic: 'StatBeschaeftigteZH', layer: 'stat-ent-p'}));
      expect(drawing.drawStatisticsHighlights).toHaveBeenLastCalledWith([point]);
      expect(statistics.loadStatistics).toHaveBeenCalledTimes(2);
    });
  });

  it.each([1, 10, 7756, 10000, 12927, 1_000_001])('queries statistics at scale %s regardless of rendering scale limits', (scale) => {
    const item = createGb2WmsMapItemMock('StatBeschaeftigteZH', 1);
    Object.assign(item.settings.layers[0], {layer: 'stat-ent-p', queryable: true, minScale: 10, maxScale: 10000});
    store.dispatch(ActiveMapItemActions.replaceActiveMapItem({modifiedActiveMapItem: item}));
    store.dispatch(MapConfigActions.setScale({scale}));
    store.dispatch(QueryLocationActions.setPoint({point, scale}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    expect(statistics.loadStatistics).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({type: 'Polygon', srs: 2056}),
      statisticsMapQueries['StatBeschaeftigteZH'].map((query) => ({topic: 'StatBeschaeftigteZH', ...query})),
    );
    if (scale <= 10 || scale >= 10000) {
      expect(topics.loadFeatureInfos).not.toHaveBeenCalled();
    } else {
      expect(topics.loadFeatureInfos).toHaveBeenCalledOnce();
    }
  });

  it('clears statistics for hidden layers and reloads on visibility changes, but retains them on zoom changes', async () => {
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
    expect(await firstValueFrom(store.select(selectLoadingState))).toBe('loaded');
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    store.dispatch(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    expect(statistics.loadStatistics).toHaveBeenCalledTimes(2);
  });
});
