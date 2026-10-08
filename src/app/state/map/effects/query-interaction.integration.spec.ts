import {TestBed} from '@angular/core/testing';
import {provideEffects} from '@ngrx/effects';
import {provideStore, Store} from '@ngrx/store';
import {firstValueFrom} from 'rxjs';
import {MAP_SERVICE} from '../../../app.tokens';
import {FeatureFlagsService} from '../../../shared/services/feature-flags.service';
import {QueryMode} from '../../../shared/types/query-mode.type';
import {ToolType} from '../../../shared/types/tool.type';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {MapUiActions} from '../actions/map-ui.actions';
import {QueryModeActions} from '../actions/query-mode.actions';
import {ToolActions} from '../actions/tool.actions';
import {reducer as mapUiReducer, selectToolMenuVisibility} from '../reducers/map-ui.reducer';
import {reducer as queryModeReducer, selectQueryMode} from '../reducers/query-mode.reducer';
import {reducer as toolReducer, selectActiveTool} from '../reducers/tool.reducer';
import {QueryModeEffects} from './query-mode.effects';
import {ToolEffects} from './tool.effects';

describe('query interaction ownership', () => {
  let store: Store;
  let statisticsEnabled: boolean;
  const tools = {
    initializeMeasurement: vi.fn(),
    initializeDrawing: vi.fn(),
    initializeDataDownloadSelection: vi.fn(),
    initializeStatisticsSelection: vi.fn(),
    cancelTool: vi.fn(),
  };

  beforeEach(() => {
    statisticsEnabled = true;
    TestBed.configureTestingModule({
      providers: [
        provideStore({mapUi: mapUiReducer, queryMode: queryModeReducer, tool: toolReducer}),
        provideEffects(QueryModeEffects, ToolEffects),
        {provide: MAP_SERVICE, useValue: {getToolService: () => tools}},
        {provide: FeatureFlagsService, useValue: {getFeatureFlag: () => statisticsEnabled}},
      ],
    });
    store = TestBed.inject(Store);
  });

  async function expectOwnership(queryMode: QueryMode, menu: ToolMenuVisibility, tool?: ToolType) {
    expect(await firstValueFrom(store.select(selectQueryMode))).toBe(queryMode);
    expect(await firstValueFrom(store.select(selectToolMenuVisibility))).toBe(menu);
    expect(await firstValueFrom(store.select(selectActiveTool))).toBe(tool);
  }

  for (const queryMode of ['feature', 'statistics'] as const) {
    for (const tool of ['measure-line', 'draw-polygon', 'select-polygon'] as const) {
      it(`releases ${tool} when explicitly selecting ${queryMode}`, async () => {
        store.dispatch(MapUiActions.toggleToolMenu({tool: 'measurement'}));
        store.dispatch(ToolActions.activateTool({tool}));
        store.dispatch(QueryModeActions.selectQueryMode({queryMode}));

        await expectOwnership(queryMode, queryMode);
        expect(tools.cancelTool).toHaveBeenCalledOnce();
      });
    }
  }

  it('releases a tool when reselecting the already active feature mode', async () => {
    store.dispatch(ToolActions.activateTool({tool: 'measure-line'}));
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'feature'}));

    await expectOwnership('feature', 'feature');
    expect(tools.cancelTool).toHaveBeenCalledOnce();
  });

  it('keeps a compatible statistics tool when reselecting statistics', async () => {
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
    store.dispatch(ToolActions.activateTool({tool: 'select-statistics-polygon'}));
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));

    await expectOwnership('statistics', 'statistics', 'select-statistics-polygon');
    expect(tools.initializeStatisticsSelection).toHaveBeenCalledOnce();
    expect(tools.cancelTool).not.toHaveBeenCalled();
  });

  it('releases statistics selection when explicitly returning to features', async () => {
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
    store.dispatch(ToolActions.activateTool({tool: 'select-statistics-circle'}));
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'feature'}));

    await expectOwnership('feature', 'feature');
    expect(tools.cancelTool).toHaveBeenCalledOnce();
  });

  it('does not cancel a newly activated measurement tool during menu synchronization', async () => {
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
    store.dispatch(ToolActions.activateTool({tool: 'measure-line'}));
    store.dispatch(MapUiActions.toggleToolMenu({tool: 'measurement'}));

    await expectOwnership('feature', 'measurement', 'measure-line');
    expect(tools.initializeMeasurement).toHaveBeenCalledOnce();
    expect(tools.cancelTool).not.toHaveBeenCalled();
  });

  it('cancels an old statistics tool when opening another menu', async () => {
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
    store.dispatch(ToolActions.activateTool({tool: 'select-statistics-circle'}));
    store.dispatch(MapUiActions.toggleToolMenu({tool: 'drawing'}));

    await expectOwnership('feature', 'drawing');
    expect(tools.cancelTool).toHaveBeenCalledOnce();
  });

  it('normalizes disabled statistics before changing tool ownership', async () => {
    statisticsEnabled = false;
    store.dispatch(ToolActions.activateTool({tool: 'measure-line'}));
    store.dispatch(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));

    await expectOwnership('feature', 'feature');
    expect(tools.initializeStatisticsSelection).not.toHaveBeenCalled();
  });
});
