import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ShareLinkEffects} from './share-link.effects';
import {Gb3ShareLinkService} from '../../../shared/services/apis/gb3/gb3-share-link.service';
import {ShareLinkActions} from '../actions/share-link.actions';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {AuthService} from '../../../auth/auth.service';
import {FavouritesService} from '../../../map/services/favourites.service';
import {RouterTestingModule} from '@angular/router/testing';
import {catchError} from 'rxjs/operators';
import {
  ShareLinkCouldNotBeLoaded,
  ShareLinkCouldNotBeValidated,
  ShareLinkItemCouldNotBeCreated,
  ShareLinkPropertyCouldNotBeValidated,
} from '../../../shared/errors/share-link.errors';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {selectLoadedLayerCatalogueAndShareItem} from '../selectors/loaded-layer-catalogue-and-share-item.selector';
import {Map, Topic} from '../../../shared/interfaces/topic.interface';
import {spyPropertyGetter} from '../../../testing/testing.utils';
import {MapConfigActions} from '../actions/map-config.actions';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {selectItems} from '../reducers/active-map-item.reducer';
import {ActiveMapItemConfiguration} from '../../../shared/interfaces/active-map-item-configuration.interface';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {ErrorHandler} from '@angular/core';
import {Gb3VectorLayer} from '../../../shared/interfaces/gb3-vector-layer.interface';

function createActiveMapItemsFromConfigs(activeMapItemConfigurations: ActiveMapItemConfiguration[]): ActiveMapItem[] {
  return activeMapItemConfigurations.map(
    (config) =>
      new Gb2WmsActiveMapItem({
        id: config.mapId,
        layers: config.layers.map((configLayer) => ({layer: configLayer.layer, visible: configLayer.visible, id: configLayer.id})),
      } as Map),
  );
}

describe('ShareLinkEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: ShareLinkEffects;
  let gb3ShareLinkService: Gb3ShareLinkService;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let favouriteServiceMock: jasmine.SpyObj<FavouritesService>;
  let errorHandlerMock: jasmine.SpyObj<ErrorHandler>;

  const shareLinkItemMock: ShareLinkItem = {
    basemapId: 'arelkbackgroundzh',
    center: {x: 2675158, y: 1259964},
    scale: 18000,
    content: [
      {
        id: 'StatGebAlterZH',
        mapId: 'StatGebAlterZH',
        layers: [
          {
            id: 132494,
            layer: 'geb-alter_wohnen',
            visible: true,
          },
          {
            id: 132495,
            layer: 'geb-alter_grau',
            visible: false,
          },
          {
            id: 132496,
            layer: 'geb-alter_2',
            visible: true,
          },
        ],
        opacity: 0.5,
        visible: true,
        isSingleLayer: false,
      },
      {
        id: 'Lageklassen2003ZH',
        mapId: 'Lageklassen2003ZH',
        layers: [
          {
            id: 135765,
            layer: 'lageklassen-2003-flaechen',
            visible: true,
          },
          {
            id: 135775,
            layer: 'lageklassen-2003-einzelobjekte',
            visible: true,
          },
        ],
        opacity: 1,
        visible: true,
        isSingleLayer: false,
      },
    ],
    drawings: {} as Gb3VectorLayer,
    measurements: {} as Gb3VectorLayer,
  };

  beforeEach(() => {
    actions$ = new Observable<Action>();
    authServiceMock = jasmine.createSpyObj<AuthService>([], {isAuthenticated$: of(false)});
    favouriteServiceMock = jasmine.createSpyObj<FavouritesService>(['getActiveMapItemsForFavourite']);
    errorHandlerMock = jasmine.createSpyObj<ErrorHandler>(['handleError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        ShareLinkEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: FavouritesService, useValue: favouriteServiceMock},
        {provide: ErrorHandler, useValue: errorHandlerMock},
        {provide: AuthService, useValue: authServiceMock},
      ],
    });
    effects = TestBed.inject(ShareLinkEffects);
    gb3ShareLinkService = TestBed.inject(Gb3ShareLinkService);
    store = TestBed.inject(MockStore);
  });

  describe('loadShareLinkItem$', () => {
    it('dispatches ShareLinkActions.setItem() with the service response on success', (done: DoneFn) => {
      const expectedItem = shareLinkItemMock;
      const expectedId = 'abcd-efgh-ijkl-mnop';
      const gb3ShareLinkServiceSpy = spyOn(gb3ShareLinkService, 'loadShareLink').and.returnValue(of(expectedItem));

      actions$ = of(ShareLinkActions.loadItem({id: expectedId}));
      effects.loadShareLinkItem$.subscribe((action) => {
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledOnceWith(expectedId);
        expect(action).toEqual(ShareLinkActions.setItem({item: expectedItem}));
        done();
      });
    });

    it('dispatches ShareLinkActions.setLoadingError() with the error on failure', (done: DoneFn) => {
      const expectedId = 'abcd-efgh-ijkl-mnop';
      const expectedError = new Error('oh no! butterfingers');
      const gb3ShareLinkServiceSpy = spyOn(gb3ShareLinkService, 'loadShareLink').and.returnValue(throwError(() => expectedError));

      actions$ = of(ShareLinkActions.loadItem({id: expectedId}));
      effects.loadShareLinkItem$.subscribe((action) => {
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledOnceWith(expectedId);
        expect(action).toEqual(ShareLinkActions.setLoadingError({error: expectedError}));
        done();
      });
    });
  });

  describe('throwLoadingError$', () => {
    it('throws a ShareLinkCouldNotBeLoaded error', (done: DoneFn) => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(ShareLinkActions.setLoadingError({error: expectedOriginalError}));
      effects.throwLoadingError$
        .pipe(
          catchError((error) => {
            const expectedError = new ShareLinkCouldNotBeLoaded(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('createShareLinkRequest$', () => {
    it('dispatches ShareLinkActions.setItemId() with the service response on success', (done: DoneFn) => {
      const expectedItem = shareLinkItemMock;
      const expectedId = 'abcd-efgh-ijkl-mnop';
      const gb3ShareLinkServiceSpy = spyOn(gb3ShareLinkService, 'createShareLink').and.returnValue(of(expectedId));

      actions$ = of(ShareLinkActions.createItem({item: expectedItem}));
      effects.createShareLinkRequest$.subscribe((action) => {
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledOnceWith(expectedItem);
        expect(action).toEqual(ShareLinkActions.setItemId({id: expectedId}));
        done();
      });
    });

    it('dispatches ShareLinkActions.setCreationError() with the error on failure', (done: DoneFn) => {
      const expectedItem = shareLinkItemMock;
      const expectedError = new Error('oh no! butterfingers');
      const gb3ShareLinkServiceSpy = spyOn(gb3ShareLinkService, 'createShareLink').and.returnValue(throwError(() => expectedError));

      actions$ = of(ShareLinkActions.createItem({item: expectedItem}));
      effects.createShareLinkRequest$.subscribe((action) => {
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledOnceWith(expectedItem);
        expect(action).toEqual(ShareLinkActions.setCreationError({error: expectedError}));
        done();
      });
    });
  });

  describe('throwCreationError$', () => {
    it('throws a ShareLinkItemCouldNotBeCreated error', (done: DoneFn) => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(ShareLinkActions.setCreationError({error: expectedOriginalError}));
      effects.throwCreationError$
        .pipe(
          catchError((error) => {
            const expectedError = new ShareLinkItemCouldNotBeCreated(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('Initialize the application based on a share link', () => {
    const expectedId = 'abcd-efgh-ijkl-mnop';
    const expectedItem = shareLinkItemMock;
    const expectedOriginalError = new ShareLinkPropertyCouldNotBeValidated("He's dead, Jim.");
    const expectedTopics: Topic[] = [];
    const expectedValidationObject = {
      activeMapItems: createActiveMapItemsFromConfigs(shareLinkItemMock.content),
      scale: shareLinkItemMock.scale,
      basemapId: shareLinkItemMock.basemapId,
      x: shareLinkItemMock.center.x,
      y: shareLinkItemMock.center.y,
    };

    describe('Action: initializeApplicationBasedOnId', () => {
      beforeEach(() => {
        actions$ = of(ShareLinkActions.initializeApplicationBasedOnId({id: expectedId}));
      });

      describe('initializeApplicationByLoadingShareLinkItem$', () => {
        it('dispatches ShareLinkActions.loadItem() with the service response on success', (done: DoneFn) => {
          effects.initializeApplicationByLoadingShareLinkItem$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.loadItem({id: expectedId}));
            done();
          });
        });
      });

      describe('initializeApplicationByLoadingTopics$', () => {
        it('dispatches LayerCatalogActions.loadLayerCatalog() with the service response on success', (done: DoneFn) => {
          effects.initializeApplicationByLoadingTopics$.subscribe((action) => {
            expect(action).toEqual(LayerCatalogActions.loadLayerCatalog());
            done();
          });
        });
      });

      describe('initializeApplicationByVerifyingSharedItem$', () => {
        it('dispatches ShareLinkActions.validateItem() after both - the ShareLinkItem and the LayerCatalog - was loaded successfully', (done: DoneFn) => {
          store.overrideSelector(selectLoadedLayerCatalogueAndShareItem, {shareLinkItem: expectedItem, topics: expectedTopics});

          effects.initializeApplicationByVerifyingSharedItem$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.validateItem({item: expectedItem, topics: expectedTopics}));
            done();
          });
        });
      });
    });

    describe('Action: validateItem', () => {
      describe('validateShareLinkItem$', () => {
        beforeEach(() => {
          favouriteServiceMock.getActiveMapItemsForFavourite.and.callFake((activeMapItemConfigurations: ActiveMapItemConfiguration[]) =>
            createActiveMapItemsFromConfigs(activeMapItemConfigurations),
          );
        });

        it('dispatches ShareLinkActions.completeValidation() with the service response on success', (done: DoneFn) => {
          actions$ = of(ShareLinkActions.validateItem({item: expectedItem, topics: expectedTopics}));

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(favouriteServiceMock.getActiveMapItemsForFavourite).toHaveBeenCalledOnceWith(expectedItem.content);
            expect(action).toEqual(ShareLinkActions.completeValidation(expectedValidationObject));
            done();
          });
        });

        it('dispatches ShareLinkActions.setValidationError() with the error on basemap validation failure', (done: DoneFn) => {
          const faultyItem: ShareLinkItem = {
            ...shareLinkItemMock,
            basemapId: 'there-is-no-map',
          };
          const expectedError = new ShareLinkPropertyCouldNotBeValidated(`Basemap ist ungültig: '${faultyItem.basemapId}'`);
          actions$ = of(ShareLinkActions.validateItem({item: faultyItem, topics: expectedTopics}));

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.setValidationError({error: expectedError}));
            done();
          });
        });

        it('dispatches ShareLinkActions.setValidationError() with the error on scale validation failure', (done: DoneFn) => {
          const faultyItem: ShareLinkItem = {
            ...shareLinkItemMock,
            scale: -1337,
          };
          const expectedError = new ShareLinkPropertyCouldNotBeValidated(`Massstab ist ungültig: '${faultyItem.scale}'`);
          actions$ = of(ShareLinkActions.validateItem({item: faultyItem, topics: expectedTopics}));

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.setValidationError({error: expectedError}));
            done();
          });
        });

        it('dispatches ShareLinkActions.setValidationError() with the error on active map items validation failure', (done: DoneFn) => {
          actions$ = of(ShareLinkActions.validateItem({item: expectedItem, topics: expectedTopics}));
          const favouriteServiceMockSpy = favouriteServiceMock.getActiveMapItemsForFavourite.and.throwError(expectedOriginalError);

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(favouriteServiceMockSpy).toHaveBeenCalledOnceWith(expectedItem.content);
            expect(action).toEqual(ShareLinkActions.setValidationError({error: expectedOriginalError}));
            done();
          });
        });
      });
    });

    describe('Action: setValidationError', () => {
      describe('handleValidationError$', () => {
        it('handles a ShareLinkCouldNotBeValidated error with the login reminder and dispatches ShareLinkActions.setInitializationError() with the error on failure', (done: DoneFn) => {
          const isAuthenticated = true;
          spyPropertyGetter(authServiceMock, 'isAuthenticated$').and.returnValue(of(isAuthenticated));
          const expectedError = new ShareLinkCouldNotBeValidated(expectedOriginalError.message, isAuthenticated, expectedOriginalError);
          actions$ = of(ShareLinkActions.setValidationError({error: expectedOriginalError}));
          effects.handleValidationError$.subscribe((action) => {
            expect(errorHandlerMock.handleError).toHaveBeenCalledOnceWith(expectedError);
            expect(action).toEqual(ShareLinkActions.setInitializationError({error: expectedError}));
            expect(action.error).toBeInstanceOf(ShareLinkCouldNotBeValidated);
            expect((action.error as ShareLinkCouldNotBeValidated).message).not.toContain(
              'Möglicherweise hilft es, wenn Sie sich einloggen.',
            );
            done();
          });
        });

        it('handles a ShareLinkCouldNotBeValidated error without the login reminder and dispatches ShareLinkActions.setInitializationError() with the error on failure', (done: DoneFn) => {
          const isAuthenticated = false;
          spyPropertyGetter(authServiceMock, 'isAuthenticated$').and.returnValue(of(isAuthenticated));
          const expectedError = new ShareLinkCouldNotBeValidated(expectedOriginalError.message, isAuthenticated, expectedOriginalError);
          actions$ = of(ShareLinkActions.setValidationError({error: expectedOriginalError}));
          effects.handleValidationError$.subscribe((action) => {
            expect(errorHandlerMock.handleError).toHaveBeenCalledOnceWith(expectedError);
            expect(action).toEqual(ShareLinkActions.setInitializationError({error: expectedError}));
            expect(action.error).toBeInstanceOf(ShareLinkCouldNotBeValidated);
            expect((action.error as ShareLinkCouldNotBeValidated).message).toContain('Möglicherweise hilft es, wenn Sie sich einloggen.');
            done();
          });
        });
      });
    });

    describe('Action: completeValidation', () => {
      beforeEach(() => {
        actions$ = of(ShareLinkActions.completeValidation(expectedValidationObject));
      });

      describe('setMapConfigAfterValidation$', () => {
        it('dispatches MapConfigActions.setInitialMapConfig() with the service response on success', (done: DoneFn) => {
          const expectedInitialMapConfig = {
            x: expectedValidationObject.x,
            y: expectedValidationObject.y,
            scale: expectedValidationObject.scale,
            basemapId: expectedValidationObject.basemapId,
            initialMaps: [],
          };

          effects.setMapConfigAfterValidation$.subscribe((action) => {
            expect(action).toEqual(MapConfigActions.setInitialMapConfig(expectedInitialMapConfig));
            done();
          });
        });
      });

      describe('setActiveMapItemsAfterValidation$', () => {
        it('dispatches ActiveMapItemActions.initializeActiveMapItems() with the service response on success', (done: DoneFn) => {
          const expectedActiveMapItems = {
            activeMapItems: expectedValidationObject.activeMapItems,
          };

          effects.setActiveMapItemsAfterValidation$.subscribe((action) => {
            expect(action).toEqual(ActiveMapItemActions.initializeActiveMapItems(expectedActiveMapItems));
            done();
          });
        });
      });

      describe('completeInitialization$', () => {
        it('dispatches ShareLinkActions.completeApplicationInitialization() after the ActiveMapItems have been set', (done: DoneFn) => {
          store.overrideSelector(selectItems, expectedValidationObject.activeMapItems);

          effects.completeInitialization$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.completeApplicationInitialization());
            done();
          });
        });
      });
    });
  });
});
