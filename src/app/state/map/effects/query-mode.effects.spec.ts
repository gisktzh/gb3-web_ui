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
import {selectIsStatisticsAvailable} from '../selectors/statistics-availability.selector';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {ToolType} from '../../../shared/types/tool.type';

describe('QueryModeEffects', () => {
  let actions$: Observable<Action>;
  let effects: QueryModeEffects;
  let store: MockStore;

  function configureTestBed(isStatisticsAvailable = true) {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      providers: [QueryModeEffects, provideMockActions(() => actions$), provideMockStore()],
    });

    effects = TestBed.inject(QueryModeEffects);
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsStatisticsAvailable, isStatisticsAvailable);
    store.overrideSelector(selectQueryMode, 'feature');
    store.overrideSelector(selectToolMenuVisibility, 'feature');
    store.overrideSelector(selectActiveTool, undefined);
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

  describe('enforceStatisticsAvailability$', () => {
    it('falls back to the feature mode if statistics are unavailable', () => {
      configureTestBed(false);
      store.overrideSelector(selectQueryMode, 'statistics');

      let actualAction;
      effects.enforceStatisticsAvailability$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(QueryModeActions.setQueryMode({queryMode: 'feature'}));
    });

    it('leaves the statistics mode alone if a supported layer is present', async () => {
      configureTestBed(true);
      store.overrideSelector(selectQueryMode, 'statistics');
      await expectNoAction(effects.enforceStatisticsAvailability$);
    });

    it('does not react to the feature mode and therefore cannot loop', async () => {
      configureTestBed(false);

      await expectNoAction(effects.enforceStatisticsAvailability$);
    });

    it('reacts when the last supported layer disappears', () => {
      configureTestBed();
      store.overrideSelector(selectQueryMode, 'statistics');
      const actual: Action[] = [];
      const subscription = effects.enforceStatisticsAvailability$.subscribe((action) => actual.push(action));
      expect(actual).toEqual([]);
      store.overrideSelector(selectIsStatisticsAvailable, false);
      store.refreshState();
      expect(actual).toEqual([QueryModeActions.setQueryMode({queryMode: 'feature'})]);
      subscription.unsubscribe();
    });

    it('closes an unavailable statistics menu even if feature mode is already active', () => {
      configureTestBed(false);
      store.overrideSelector(selectToolMenuVisibility, 'statistics');
      const actual: Action[] = [];
      const subscription = effects.enforceStatisticsAvailability$.subscribe((action) => actual.push(action));
      expect(actual).toEqual([QueryModeActions.setQueryMode({queryMode: 'feature'})]);
      subscription.unsubscribe();
    });
  });

  describe('selectQueryMode$', () => {
    it('selects statistics when a supported layer is present', () => {
      configureTestBed();
      actions$ = of(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
      const actual: Action[] = [];
      effects.selectQueryMode$.subscribe((action) => actual.push(action));
      expect(actual).toEqual([MapUiActions.toggleToolMenu({tool: 'statistics'})]);
    });

    it('falls back to feature mode for unavailable explicit statistics selection', () => {
      configureTestBed(false);
      store.overrideSelector(selectActiveTool, 'measure-line');
      actions$ = of(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
      const actual: Action[] = [];
      effects.selectQueryMode$.subscribe((action) => actual.push(action));
      expect(actual).toEqual([ToolActions.cancelTool(), MapUiActions.toggleToolMenu({tool: 'feature'})]);
    });
  });

  describe('openStatisticsToolMenu$', () => {
    it('does not open an unavailable statistics submenu', async () => {
      configureTestBed(false);
      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'statistics'}));
      await expectNoAction(effects.openStatisticsToolMenu$);
    });
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
    it('does not enter statistics through an unavailable tool menu', async () => {
      configureTestBed(false);
      actions$ = of(MapUiActions.toggleToolMenu({tool: 'statistics'}));
      await expectNoAction(effects.syncQueryModeWithToolMenu$);
    });
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
