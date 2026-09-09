import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideMockStore} from '@ngrx/store/testing';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {QueryModeEffects} from './query-mode.effects';
import {QueryModeActions} from '../actions/query-mode.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {FeatureFlagsService} from '../../../shared/services/feature-flags.service';

describe('QueryModeEffects', () => {
  let actions$: Observable<Action>;
  let effects: QueryModeEffects;

  function configureTestBed(isStatisticsToolEnabled: boolean) {
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
      vi.useFakeTimers();
      configureTestBed(true);

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'statistics'}));

      let actualAction;
      effects.enforceFeatureFlag$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();

      expect(actualAction).toBeUndefined();

      vi.useRealTimers();
    });

    it('does not react to the feature mode and therefore cannot loop', async () => {
      vi.useFakeTimers();
      configureTestBed(false);

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'feature'}));

      let actualAction;
      effects.enforceFeatureFlag$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();

      expect(actualAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('toggleStatisticsToolMenu$', () => {
    it('opens the statistics submenu when the statistics mode is selected', () => {
      configureTestBed(true);

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'statistics'}));

      let actualAction;
      effects.toggleStatisticsToolMenu$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(MapUiActions.toggleToolMenu({tool: 'statistics'}));
    });

    it('closes the submenu when the feature mode is selected', () => {
      configureTestBed(true);

      actions$ = of(QueryModeActions.setQueryMode({queryMode: 'feature'}));

      let actualAction;
      effects.toggleStatisticsToolMenu$.subscribe((action) => (actualAction = action));

      expect(actualAction).toEqual(MapUiActions.toggleToolMenu({tool: undefined}));
    });
  });
});
