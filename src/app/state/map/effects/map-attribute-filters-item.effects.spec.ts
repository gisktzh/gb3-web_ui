import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {MapUiActions} from '../actions/map-ui.actions';
import {selectScreenMode} from '../../app/reducers/app-layout.reducer';
import {MapAttributeFiltersItemActions} from '../actions/map-attribute-filters-item.actions';
import {MapAttributeFiltersItemEffects} from './map-attribute-filters-item.effects';
import {ScreenMode} from '../../../shared/types/screen-size.type';

describe('MapAttributeFiltersItemEffects', () => {
  let actions$: Observable<Action>;
  let effects: MapAttributeFiltersItemEffects;
  let store: MockStore;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      providers: [MapAttributeFiltersItemEffects, provideMockActions(() => actions$), provideMockStore()],
    });

    effects = TestBed.inject(MapAttributeFiltersItemEffects);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('showMapAttributes$', () => {
    it('dispatches MapUIActions.showBottomSheet when screenMode is mobile', () => {
      store.overrideSelector(selectScreenMode, 'mobile');

      const expectedAction = MapUiActions.showBottomSheet({bottomSheetContent: 'map-attributes'});

      actions$ = of(MapAttributeFiltersItemActions.setMapAttributeFiltersItemId({id: '123'}));
      effects.showMapAttributes$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    [{screenMode: 'regular'}, {screenMode: 'smallTablet'}].forEach(({screenMode}) =>
      it(`does not dispatch MapUiActions.showBottomSheet() when screenMode is ${screenMode}`, async () => {
        vi.useFakeTimers();

        store.overrideSelector(selectScreenMode, screenMode as ScreenMode);
        let actualAction;

        actions$ = of(MapAttributeFiltersItemActions.setMapAttributeFiltersItemId({id: '123'}));
        effects.showMapAttributes$.subscribe((action) => (actualAction = action));
        await vi.runAllTimersAsync();

        expect(actualAction).toBeUndefined();

        vi.useRealTimers();
      }),
    );
  });
});
