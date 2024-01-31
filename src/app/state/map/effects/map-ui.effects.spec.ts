import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MapUiEffects} from './map-ui.effects';
import {provideMockActions} from '@ngrx/effects/testing';
import {MatDialog} from '@angular/material/dialog';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {MapUiActions} from '../actions/map-ui.actions';
import {ShareLinkDialogComponent} from '../../../map/components/share-link-dialog/share-link-dialog.component';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ShareLinkActions} from '../actions/share-link.actions';
import {selectCurrentShareLinkItem} from '../selectors/current-share-link-item.selector';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {SymbolizationToGb3ConverterUtils} from '../../../shared/utils/symbolization-to-gb3-converter.utils';
import {selectScreenMode} from '../../app/reducers/app-layout.reducer';
import {MapAttributeFiltersItemActions} from '../actions/map-attribute-filters-item.actions';
import {selectMapAttributeFiltersItem} from '../selectors/map-attribute-filters-item.selector';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';

describe('MapUiEffects', () => {
  let actions$: Observable<Action>;
  let effects: MapUiEffects;
  let dialogService: jasmine.SpyObj<MatDialog>;
  let store: MockStore;
  const shareLinkItem: ShareLinkItem = {
    center: {x: 1, y: 1},
    scale: 101,
    basemapId: 'basemap',
    content: [],
    drawings: SymbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation([]),
    measurements: SymbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation([]),
  };

  beforeEach(() => {
    actions$ = new Observable<Action>();
    const spyDialogService = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [MapUiEffects, provideMockActions(() => actions$), provideMockStore(), {provide: MatDialog, useValue: spyDialogService}],
    });

    effects = TestBed.inject(MapUiEffects);
    store = TestBed.inject(MockStore);
    dialogService = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
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
    it('dispatches ShareLinkActions.createItem()', (done: DoneFn) => {
      store.overrideSelector(selectCurrentShareLinkItem, shareLinkItem);

      const expectedAction = ShareLinkActions.createItem({item: shareLinkItem});
      actions$ = of(MapUiActions.showShareLinkDialog());

      effects.createShareLinkAfterDialogOpen$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('createShareLinkAfterBottomSheetOpen$', () => {
    it('dispatches ShareLinkActions.createItem() if the bottomSheetContent is share-link', (done: DoneFn) => {
      store.overrideSelector(selectCurrentShareLinkItem, shareLinkItem);
      const expectedAction = ShareLinkActions.createItem({item: shareLinkItem});

      actions$ = of(MapUiActions.showBottomSheet({bottomSheetContent: 'share-link'}));
      effects.createShareLinkAfterBottomSheetOpen$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('does not dispatch ShareLinkActions.createItem() if the bottomSheetContent is not share-link', fakeAsync(() => {
      store.overrideSelector(selectCurrentShareLinkItem, shareLinkItem);
      let actualAction;

      actions$ = of(MapUiActions.showBottomSheet({bottomSheetContent: 'basemap'}));
      effects.createShareLinkAfterBottomSheetOpen$.subscribe((action) => (actualAction = action));
      tick();

      expect(actualAction).toBeUndefined();
    }));
  });

  describe('closeAttributeFilterWhenOpeningLegend$', () => {
    it('dispatches MapUiActions.setAttributeFilterVisibility() when the legend is openend on desktop', (done: DoneFn) => {
      store.overrideSelector(selectScreenMode, 'regular');
      const expectedAction = MapUiActions.setAttributeFilterVisibility({isVisible: false});

      actions$ = of(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
      effects.closeAttributeFilterWhenOpeningLegend$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('does not dispatch MapUiActions.setAttributeFilterVisibility() when the legend is openend on mobile', fakeAsync(() => {
      store.overrideSelector(selectScreenMode, 'mobile');
      let actualAction;

      actions$ = of(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
      effects.closeAttributeFilterWhenOpeningLegend$.subscribe((action) => (actualAction = action));
      tick();

      expect(actualAction).toBeUndefined();
    }));
  });

  describe('closeAttributeFilterIfAttributeFilterItemIsUndefined$', () => {
    it('dispatches MapUiActions.setAttributeFilterVisibility() when the current mapAttributeFilter is undefined', (done: DoneFn) => {
      const activeMapItem = createGb2WmsMapItemMock('123');
      store.overrideSelector(selectMapAttributeFiltersItem, undefined);

      const expectedAction = MapUiActions.setAttributeFilterVisibility({isVisible: false});

      actions$ = of(ActiveMapItemActions.removeActiveMapItem({activeMapItem}));
      effects.closeAttributeFilterIfAttributeFilterItemIsUndefined$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('does not dispatch MapUiActions.setAttributeFilterVisibility() when the mapAttributeFilter is defined', fakeAsync(() => {
      const removedMapItem = createGb2WmsMapItemMock('123');
      const filterMapItem = createGb2WmsMapItemMock('456');
      store.overrideSelector(selectMapAttributeFiltersItem, filterMapItem);
      let actualAction;

      actions$ = of(ActiveMapItemActions.removeActiveMapItem({activeMapItem: removedMapItem}));
      effects.closeAttributeFilterIfAttributeFilterItemIsUndefined$.subscribe((action) => (actualAction = action));
      tick();

      expect(actualAction).toBeUndefined();
    }));
  });

  describe('openAttributeFilterOverlay', () => {
    it('dispatches MapUiActions.setAttributeFilterVisibility() when the attributeFilterItemID is set', (done: DoneFn) => {
      const expectedAction = MapUiActions.setAttributeFilterVisibility({isVisible: true});

      actions$ = of(MapAttributeFiltersItemActions.setMapAttributeFiltersItemId({id: '123'}));
      effects.openAttributeFilterOverlay.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });
});
