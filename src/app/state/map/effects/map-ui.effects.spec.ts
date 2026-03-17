import type {MockedObject} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {MapUiEffects} from './map-ui.effects';
import {provideMockActions} from '@ngrx/effects/testing';
import {MatDialog} from '@angular/material/dialog';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {MapUiActions} from '../actions/map-ui.actions';
import {ShareLinkDialogComponent} from '../../../map/components/share-link-dialog/share-link-dialog.component';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ShareLinkActions} from '../actions/share-link.actions';
import {selectCurrentInternalShareLinkItem} from '../selectors/current-share-link-item.selector';
import {selectScreenMode} from '../../app/reducers/app-layout.reducer';
import {MapAttributeFiltersItemActions} from '../actions/map-attribute-filters-item.actions';
import {selectMapAttributeFiltersItem} from '../selectors/map-attribute-filters-item.selector';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {SearchActions} from '../../app/actions/search.actions';
import {GeometryWithSrsSearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {InternalShareLinkItem} from 'src/app/shared/interfaces/internal-share-link.interface';
import {ShareLinkItem} from 'src/app/shared/interfaces/share-link.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolServiceStub} from 'src/app/testing/map-testing/drawing-symbol-service.stub';

describe('MapUiEffects', () => {
  let actions$: Observable<Action>;
  let effects: MapUiEffects;
  let dialogService: MockedObject<MatDialog>;
  let store: MockStore;
  const internalShareLinkItem: InternalShareLinkItem = {
    center: {x: 1, y: 1},
    scale: 101,
    basemapId: 'basemap',
    content: [],
    drawings: [],
    measurements: [],
  };

  const shareLinkItem: ShareLinkItem = {
    center: {x: 1, y: 1},
    scale: 101,
    basemapId: 'basemap',
    content: [],
    drawings: {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
      styles: {},
    },
    measurements: {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
      styles: {},
    },
  };

  beforeEach(() => {
    actions$ = new Observable<Action>();
    const spyDialogService: Partial<MatDialog> = {
      open: vi.fn().mockName('MatDialog.open'),
    };

    TestBed.configureTestingModule({
      providers: [
        MapUiEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MatDialog, useValue: spyDialogService},
        {provide: DRAWING_SYMBOLS_SERVICE, useClass: DrawingSymbolServiceStub},
      ],
    });

    effects = TestBed.inject(MapUiEffects);
    store = TestBed.inject(MockStore);
    dialogService = TestBed.inject(MatDialog) as MockedObject<MatDialog>;
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('openShareLinkDialog$', () => {
    it('opens the ShareLinkDialog, no further action dispatch', () => {
      actions$ = of(MapUiActions.showShareLinkDialog());

      effects.openShareLinkDialog$.subscribe(() => {
        expect(dialogService.open).toHaveBeenCalledWith(ShareLinkDialogComponent, {
          panelClass: 'api-wrapper-dialog',
          restoreFocus: false,
          autoFocus: false,
        });
      });
    });
  });

  describe('createShareLinkAfterDialogOpen$', () => {
    it('dispatches ShareLinkActions.createItem()', () => {
      store.overrideSelector(selectCurrentInternalShareLinkItem, internalShareLinkItem);

      const expectedAction = ShareLinkActions.createItem({item: shareLinkItem});
      actions$ = of(MapUiActions.showShareLinkDialog());

      effects.createShareLinkAfterDialogOpen$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('createShareLinkAfterBottomSheetOpen$', () => {
    it('dispatches ShareLinkActions.createItem() if the bottomSheetContent is share-link', () => {
      store.overrideSelector(selectCurrentInternalShareLinkItem, internalShareLinkItem);
      const expectedAction = ShareLinkActions.createItem({item: shareLinkItem});

      actions$ = of(MapUiActions.showBottomSheet({bottomSheetContent: 'share-link'}));
      effects.createShareLinkAfterBottomSheetOpen$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('does not dispatch ShareLinkActions.createItem() if the bottomSheetContent is not share-link', async () => {
      vi.useFakeTimers();

      store.overrideSelector(selectCurrentInternalShareLinkItem, internalShareLinkItem);
      let actualAction;

      actions$ = of(MapUiActions.showBottomSheet({bottomSheetContent: 'basemap'}));
      effects.createShareLinkAfterBottomSheetOpen$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();

      expect(actualAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('closeAttributeFilterWhenOpeningLegend$', () => {
    it('dispatches MapUiActions.setAttributeFilterVisibility() when the legend is openend on desktop', () => {
      store.overrideSelector(selectScreenMode, 'regular');
      const expectedAction = MapUiActions.setAttributeFilterVisibility({isVisible: false});

      actions$ = of(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
      effects.closeAttributeFilterWhenOpeningLegend$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('does not dispatch MapUiActions.setAttributeFilterVisibility() when the legend is openend on mobile', async () => {
      vi.useFakeTimers();

      store.overrideSelector(selectScreenMode, 'mobile');
      let actualAction;

      actions$ = of(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
      effects.closeAttributeFilterWhenOpeningLegend$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();

      expect(actualAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('closeAttributeFilterIfAttributeFilterItemIsUndefined$', () => {
    it('dispatches MapUiActions.setAttributeFilterVisibility() when the current mapAttributeFilter is undefined', () => {
      const activeMapItem = createGb2WmsMapItemMock('123');
      store.overrideSelector(selectMapAttributeFiltersItem, undefined);

      const expectedAction = MapUiActions.setAttributeFilterVisibility({isVisible: false});

      actions$ = of(ActiveMapItemActions.removeActiveMapItem({activeMapItem}));
      effects.closeAttributeFilterIfAttributeFilterItemIsUndefined$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('does not dispatch MapUiActions.setAttributeFilterVisibility() when the mapAttributeFilter is defined', async () => {
      vi.useFakeTimers();

      const removedMapItem = createGb2WmsMapItemMock('123');
      const filterMapItem = createGb2WmsMapItemMock('456');
      store.overrideSelector(selectMapAttributeFiltersItem, filterMapItem);
      let actualAction;

      actions$ = of(ActiveMapItemActions.removeActiveMapItem({activeMapItem: removedMapItem}));
      effects.closeAttributeFilterIfAttributeFilterItemIsUndefined$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();

      expect(actualAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('openAttributeFilterOverlay', () => {
    it('dispatches MapUiActions.setAttributeFilterVisibility() when the attributeFilterItemID is set', () => {
      const expectedAction = MapUiActions.setAttributeFilterVisibility({isVisible: true});

      actions$ = of(MapAttributeFiltersItemActions.setMapAttributeFiltersItemId({id: '123'}));
      effects.openAttributeFilterOverlay.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('closeBottomSheetAfterSelectingSearchResult$', () => {
    it('dispatches MapUiActions.hideBottomSheet() when a result is selected in the search on mobile', () => {
      const expectedAction = MapUiActions.hideBottomSheet();
      const searchResultsMock: GeometryWithSrsSearchApiResultMatch = {
        indexType: 'places',
        displayString: 'Some Place',
        score: 1,
        geometry: {type: 'Point', srs: 2056, coordinates: [1, 2]},
      };

      store.overrideSelector(selectScreenMode, 'mobile');

      actions$ = of(SearchActions.selectMapSearchResult({searchResult: searchResultsMock}));
      effects.closeBottomSheetAfterSelectingSearchResult$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches nothing when a result is selected in the search on desktop', async () => {
      vi.useFakeTimers();

      const searchResultsMock: GeometryWithSrsSearchApiResultMatch = {
        indexType: 'places',
        displayString: 'Some Place',
        score: 1,
        geometry: {type: 'Point', srs: 2056, coordinates: [1, 2]},
      };

      store.overrideSelector(selectScreenMode, 'regular');
      let newAction;
      actions$ = of(SearchActions.selectMapSearchResult({searchResult: searchResultsMock}));
      effects.closeBottomSheetAfterSelectingSearchResult$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();
      expect(newAction).toBeUndefined();

      vi.useRealTimers();
    });
  });
});
