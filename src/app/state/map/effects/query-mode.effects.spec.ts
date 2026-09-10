import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {QueryModeEffects} from './query-mode.effects';
import {QueryModeActions} from '../actions/query-mode.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {ToolActions} from '../actions/tool.actions';
import {selectToolMenuVisibility} from '../reducers/map-ui.reducer';
import {selectQueryMode} from '../reducers/query-mode.reducer';
import {selectActiveTool} from '../reducers/tool.reducer';
import {FeatureFlagsService} from '../../../shared/services/feature-flags.service';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {ToolType} from '../../../shared/types/tool.type';

describe('QueryModeEffects', () => {
  let actions$: Observable<Action>;
  let effects: QueryModeEffects;
  let store: MockStore;

  function configureTestBed(isStatisticsToolEnabled = true) {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      providers: [
        QueryModeEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: FeatureFlagsService, useValue: {getFeatureFlag: () => isStatisticsToolEnabled}},
      ],
    });

    effects = TestBed.inject(QueryModeEffects);
    store = TestBed.inject(MockStore);
  }

  afterEach(() => {
    store.resetSelectors();
  });

  async function expectNoAction(effect$: Observable<Action>) {
    vi.useFakeTimers();
    let actualAction;
    effect$.subscribe((action) => (actualAction = action));
    await vi.runAllTimersAsync();
    vi.useRealTimers();

    expect(actualAction).toBeUndefined();
  }

  describe('enforceFeatureFlag$', () => {
    it('falls back to the feature mode if the statistics tool is disabled', () => {
      configureTestBed(false);

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'statistics'}));

      let actualAction;
      effects.enforceFeatureFlag$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    });

    it('leaves the statistics mode alone if the statistics tool is enabled', async () => {
      configureTestBed(true);

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'statistics'}));

      await expectNoAction(effects.enforceFeatureFlag$);
    });

    it('does not react to the feature mode and therefore cannot loop', async () => {
      configureTestBed(false);

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'feature'}));

      await expectNoAction(effects.enforceFeatureFlag$);
    });
  });

  describe('openStatisticsToolMenu$', () => {
    it('opens the statistics submenu when the statistics mode is selected', () => {
      configureTestBed();
      store.overrideSelector(selectToolMenuVisibility, 'feature');

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'statistics'}));

      let actualAction;
      effects.openStatisticsToolMenu$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(MapUiActions.toggleToolMenu({tool: 'statistics'}));
    });

    it('does not open it when the feature mode is selected', async () => {
      configureTestBed();
      store.overrideSelector(selectToolMenuVisibility, 'feature');

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'feature'}));

      await expectNoAction(effects.openStatisticsToolMenu$);
    });

    it('does not open it again if it is already open, which would loop', async () => {
      configureTestBed();
      store.overrideSelector(selectToolMenuVisibility, 'statistics');

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'statistics'}));

      await expectNoAction(effects.openStatisticsToolMenu$);
    });
  });

  describe('closeStatisticsToolMenu$', () => {
    it('falls back to the feature tool when the feature mode is selected', () => {
      configureTestBed();
      store.overrideSelector(selectToolMenuVisibility, 'statistics');

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'feature'}));

      let actualAction;
      effects.closeStatisticsToolMenu$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(MapUiActions.toggleToolMenu({tool: 'feature'}));
    });

    it('keeps the menu of another tool open, as opening that menu is what left the mode', async () => {
      configureTestBed();
      store.overrideSelector(selectToolMenuVisibility, 'measurement');

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'feature'}));

      await expectNoAction(effects.closeStatisticsToolMenu$);
    });

    it('does not react if the feature tool is already the active one, which would loop', async () => {
      configureTestBed();
      store.overrideSelector(selectToolMenuVisibility, 'feature');

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'feature'}));

      await expectNoAction(effects.closeStatisticsToolMenu$);
    });
  });

  describe('syncQueryModeWithToolMenu$', () => {
    it('enters the statistics mode when the statistics tool is picked', () => {
      configureTestBed();
      store.overrideSelector(selectQueryMode, 'feature');

      actions$ = of(MapUiActions.toggleToolMenu({tool: 'statistics'}));

      let actualAction;
      effects.syncQueryModeWithToolMenu$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
    });

    (['feature', 'measurement', 'drawing', 'data-download'] as ToolMenuVisibility[]).forEach((tool) =>
      it(`leaves the statistics mode when the ${tool} tool is picked`, () => {
        configureTestBed();
        store.overrideSelector(selectQueryMode, 'statistics');

        actions$ = of(MapUiActions.toggleToolMenu({tool}));

        let actualAction;
        effects.syncQueryModeWithToolMenu$.subscribe((action) => (actualAction = action));

        expect(actualAction).toEqual(QueryModeActions.setQueryMode({queryMode: 'feature'}));
      }),
    );

    it('does not repeat the mode that is already selected, which would loop', async () => {
      configureTestBed();
      store.overrideSelector(selectQueryMode, 'statistics');

      actions$ = of(MapUiActions.toggleToolMenu({tool: 'statistics'}));

      await expectNoAction(effects.syncQueryModeWithToolMenu$);
    });

    it('does nothing if the statistics mode is not active anyway', async () => {
      configureTestBed();
      store.overrideSelector(selectQueryMode, 'feature');

      actions$ = of(MapUiActions.toggleToolMenu({tool: 'measurement'}));

      await expectNoAction(effects.syncQueryModeWithToolMenu$);
    });
  });

  describe('cancelStatisticsToolOnLeavingMode$', () => {
    (['select-statistics-circle', 'select-statistics-polygon'] as ToolType[]).forEach((tool) =>
      it(`cancels ${tool} when the statistics mode is left`, () => {
        configureTestBed();
        store.overrideSelector(selectActiveTool, tool);

        actions$ = of(QueryModeActions.setQueryMode({queryMode: 'feature'}));

        let actualAction;
        effects.cancelStatisticsToolOnLeavingMode$.subscribe((action) => (actualAction = action));

        expect(actualAction).toEqual(ToolActions.cancelTool());
      }),
    );

    it('leaves a tool of another mode alone, as that is the tool the user just picked', async () => {
      configureTestBed();
      store.overrideSelector(selectActiveTool, 'measure-line');

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'feature'}));

      await expectNoAction(effects.cancelStatisticsToolOnLeavingMode$);
    });

    it('does nothing if no tool is active', async () => {
      configureTestBed();
      store.overrideSelector(selectActiveTool, undefined);

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'feature'}));

      await expectNoAction(effects.cancelStatisticsToolOnLeavingMode$);
    });
  });
});
