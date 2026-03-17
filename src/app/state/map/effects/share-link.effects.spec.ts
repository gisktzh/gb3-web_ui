import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ShareLinkEffects} from './share-link.effects';
import {Gb3ShareLinkService} from '../../../shared/services/apis/gb3/gb3-share-link.service';
import {ShareLinkActions} from '../actions/share-link.actions';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {FavouritesService} from '../../../map/services/favourites.service';
import {catchError} from 'rxjs';
import {
  ShareLinkCouldNotBeLoaded,
  ShareLinkCouldNotBeValidated,
  ShareLinkItemCouldNotBeCreated,
  ShareLinkPropertyCouldNotBeValidated,
} from '../../../shared/errors/share-link.errors';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {selectLoadedLayerCatalogueAndShareItem} from '../selectors/loaded-layer-catalogue-and-share-item.selector';
import {Map, Topic} from '../../../shared/interfaces/topic.interface';
import {MapConfigActions} from '../actions/map-config.actions';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {selectItems} from '../selectors/active-map-items.selector';
import {ActiveMapItemConfiguration} from '../../../shared/interfaces/active-map-item-configuration.interface';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {Gb3VectorLayer} from '../../../shared/interfaces/gb3-vector-layer.interface';
import {selectDrawings} from '../reducers/drawing.reducer';
import {DrawingActions} from '../actions/drawing.actions';
import {Gb3StyledInternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingLayerPrefix, UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {selectIsAuthenticated, selectIsAuthenticationInitialized} from '../../auth/reducers/auth-status.reducer';
import {MapRestoreItem} from '../../../shared/interfaces/map-restore-item.interface';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {TimeService} from '../../../shared/interfaces/time-service.interface';
import {TIME_SERVICE} from '../../../app.tokens';
import {AuthService} from 'src/app/auth/auth.service';

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
  const authServiceMock: Partial<AuthService> = {
    login: vi.fn(),
  };
  const favouriteServiceMock = {
    getActiveMapItemsForFavourite: vi.fn(),
    getDrawingsForFavourite: vi.fn(),
  };
  let timeService: TimeService;
  let shareLinkItemMock: ShareLinkItem;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ShareLinkEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: FavouritesService, useValue: favouriteServiceMock},
        {provide: AuthService, useValue: authServiceMock},
      ],
    });
    effects = TestBed.inject(ShareLinkEffects);
    gb3ShareLinkService = TestBed.inject(Gb3ShareLinkService);
    timeService = TestBed.inject(TIME_SERVICE);
    store = TestBed.inject(MockStore);
    shareLinkItemMock = {
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
          timeExtent: {start: timeService.createUTCDateFromString('1000'), end: timeService.createUTCDateFromString('2020')},
          attributeFilters: [
            {
              parameter: 'FILTER_GEBART',
              name: 'Anzeigeoptionen nach Hauptnutzung',
              activeFilters: [
                {name: 'Wohnen', isActive: false},
                {name: 'Andere', isActive: false},
                {
                  name: 'Gewerbe und Verwaltung',
                  isActive: false,
                },
              ],
            },
          ],
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
          timeExtent: undefined,
          attributeFilters: undefined,
        },
      ],
      drawings: {
        type: 'Vector',
        geojson: {
          type: 'FeatureCollection',
          features: [{type: 'Feature', geometry: {type: 'Point', coordinates: [0, 1]}, properties: {text: 'drawing', style: ''}}],
        },
      } as Gb3VectorLayer,
      measurements: {
        type: 'Vector',
        geojson: {
          type: 'FeatureCollection',
          features: [{type: 'Feature', geometry: {type: 'Point', coordinates: [0, 1]}, properties: {text: 'measurement', style: ''}}],
        },
      } as Gb3VectorLayer,
    };
  });

  describe('loadShareLinkItem$', () => {
    it('dispatches ShareLinkActions.setItem() with the service response on success', () => {
      const expectedItem = shareLinkItemMock;
      const expectedId = 'abcd-efgh-ijkl-mnop';
      const gb3ShareLinkServiceSpy = vi.spyOn(gb3ShareLinkService, 'loadShareLink').mockReturnValue(of(expectedItem));

      actions$ = of(ShareLinkActions.loadItem({id: expectedId}));
      effects.loadShareLinkItem$.subscribe((action) => {
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledTimes(1);
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledWith(expectedId);
        expect(action).toEqual(ShareLinkActions.setItem({item: expectedItem}));
      });
    });

    it('dispatches ShareLinkActions.setLoadingError() with the error on failure', () => {
      const expectedId = 'abcd-efgh-ijkl-mnop';
      const expectedError = new Error('oh no! butterfingers');
      const gb3ShareLinkServiceSpy = vi.spyOn(gb3ShareLinkService, 'loadShareLink').mockReturnValue(throwError(() => expectedError));

      actions$ = of(ShareLinkActions.loadItem({id: expectedId}));
      effects.loadShareLinkItem$.subscribe((action) => {
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledTimes(1);
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledWith(expectedId);
        expect(action).toEqual(ShareLinkActions.setLoadingError({error: expectedError}));
      });
    });
  });

  describe('throwLoadingError$', () => {
    it('throws a ShareLinkCouldNotBeLoaded error', () => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(ShareLinkActions.setLoadingError({error: expectedOriginalError}));
      effects.throwLoadingError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new ShareLinkCouldNotBeLoaded(expectedOriginalError);
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('createShareLinkRequest$', () => {
    it('dispatches ShareLinkActions.setItemId() with the service response on success', () => {
      const expectedItem = shareLinkItemMock;
      const expectedId = 'abcd-efgh-ijkl-mnop';
      const gb3ShareLinkServiceSpy = vi.spyOn(gb3ShareLinkService, 'createShareLink').mockReturnValue(of(expectedId));

      actions$ = of(ShareLinkActions.createItem({item: expectedItem}));
      effects.createShareLinkRequest$.subscribe((action) => {
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledTimes(1);
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledWith(expectedItem);
        expect(action).toEqual(ShareLinkActions.setItemId({id: expectedId}));
      });
    });

    it('dispatches ShareLinkActions.setCreationError() with the error on failure', () => {
      const expectedItem = shareLinkItemMock;
      const expectedError = new Error('oh no! butterfingers');
      const gb3ShareLinkServiceSpy = vi.spyOn(gb3ShareLinkService, 'createShareLink').mockReturnValue(throwError(() => expectedError));

      actions$ = of(ShareLinkActions.createItem({item: expectedItem}));
      effects.createShareLinkRequest$.subscribe((action) => {
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledTimes(1);
        expect(gb3ShareLinkServiceSpy).toHaveBeenCalledWith(expectedItem);
        expect(action).toEqual(ShareLinkActions.setCreationError({error: expectedError}));
      });
    });
  });

  describe('throwCreationError$', () => {
    it('throws a ShareLinkItemCouldNotBeCreated error', () => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(ShareLinkActions.setCreationError({error: expectedOriginalError}));
      effects.throwCreationError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new ShareLinkItemCouldNotBeCreated(expectedOriginalError);
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('Initialize the application based on a share link', () => {
    const expectedId = 'abcd-efgh-ijkl-mnop';
    const expectedOriginalError = new ShareLinkPropertyCouldNotBeValidated("He's dead, Jim.");
    const expectedTopics: Topic[] = [];
    let expectedCompleteItem: MapRestoreItem;
    let expectedItem: ShareLinkItem;

    beforeEach(() => {
      expectedItem = shareLinkItemMock;
      expectedCompleteItem = {
        activeMapItems: createActiveMapItemsFromConfigs(shareLinkItemMock.content),
        scale: shareLinkItemMock.scale,
        basemapId: shareLinkItemMock.basemapId,
        x: shareLinkItemMock.center.x,
        y: shareLinkItemMock.center.y,
        drawings: [
          {id: 'mockDrawing1', source: UserDrawingLayer.Drawings, geometry: {type: 'Point', srs: 2056, coordinates: [0, 0]}},
          {id: 'mockDrawing2', source: UserDrawingLayer.Measurements, geometry: {type: 'Point', srs: 2056, coordinates: [0, 0]}},
        ] as Gb3StyledInternalDrawingRepresentation[],
      };
    });

    describe('Action: Initialize Application Based On Id', () => {
      describe('waitForAuthenticationStatusToBeLoaded$', () => {
        it('does not dispatch ShareLinkActions.authenticationInitialized() as long as the initialData is not loaded', async () => {
          vi.useFakeTimers();

          actions$ = of(ShareLinkActions.initializeApplicationBasedOnId({id: expectedId}));
          store.overrideSelector(selectIsAuthenticationInitialized, false);
          let newAction: Action | undefined;
          effects.waitForAuthenticationStatusToBeLoaded$.subscribe((action) => (newAction = action));

          await vi.runAllTimersAsync();

          expect(newAction).toBeUndefined();

          vi.useRealTimers();
        });
        it('dispatches ShareLinkActions.authenticationInitialized() when the initialData is loaded', () => {
          actions$ = of(ShareLinkActions.initializeApplicationBasedOnId({id: expectedId}));
          store.overrideSelector(selectIsAuthenticationInitialized, true);
          effects.waitForAuthenticationStatusToBeLoaded$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.completedAuthenticationInitialization({id: expectedId}));
          });
        });
      });
    });

    describe('Action: Authentication Initialized', () => {
      beforeEach(() => {
        actions$ = of(ShareLinkActions.completedAuthenticationInitialization({id: expectedId}));
      });

      describe('initializeApplicationByLoadingShareLinkItem$', () => {
        it('dispatches ShareLinkActions.loadItem() with the service response on success', () => {
          effects.initializeApplicationByLoadingShareLinkItem$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.loadItem({id: expectedId}));
          });
        });
      });

      describe('initializeApplicationByLoadingTopics$', () => {
        it('dispatches LayerCatalogActions.loadLayerCatalog() with the service response on success', () => {
          effects.initializeApplicationByLoadingTopics$.subscribe((action) => {
            expect(action).toEqual(LayerCatalogActions.loadLayerCatalog());
          });
        });
      });

      describe('initializeApplicationByVerifyingSharedItem$', () => {
        it('dispatches ShareLinkActions.validateItem() after both - the ShareLinkItem and the LayerCatalog - was loaded successfully', () => {
          store.overrideSelector(selectLoadedLayerCatalogueAndShareItem, {shareLinkItem: expectedItem, topics: expectedTopics});

          effects.initializeApplicationByVerifyingSharedItem$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.validateItem({item: expectedItem}));
          });
        });
      });
    });

    describe('Action: validateItem', () => {
      describe('validateShareLinkItem$', () => {
        beforeEach(() => {
          favouriteServiceMock.getActiveMapItemsForFavourite.mockImplementation(
            (activeMapItemConfigurations: ActiveMapItemConfiguration[]) => createActiveMapItemsFromConfigs(activeMapItemConfigurations),
          );
        });

        it('dispatches ShareLinkActions.completeValidation() with the service response on success with no drawings', () => {
          actions$ = of(ShareLinkActions.validateItem({item: expectedItem}));
          favouriteServiceMock.getDrawingsForFavourite.mockReturnValue(
            Promise.resolve({
              drawingsToAdd: [],
              drawingActiveMapItems: [],
            }),
          );

          const expectedAction = ShareLinkActions.completeValidation({mapRestoreItem: {...expectedCompleteItem, drawings: []}});

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(favouriteServiceMock.getActiveMapItemsForFavourite).toHaveBeenCalledTimes(1);
            expect(favouriteServiceMock.getActiveMapItemsForFavourite).toHaveBeenCalledWith(expectedItem.content, false);
            expect(favouriteServiceMock.getDrawingsForFavourite).toHaveBeenCalledTimes(1);
            expect(favouriteServiceMock.getDrawingsForFavourite).toHaveBeenCalledWith(expectedItem.drawings, expectedItem.measurements);
            expect(action).toEqual(expectedAction);
          });
        });

        it(
          'dispatches ShareLinkActions.completeValidation() with the service response on success with drawings added on top of the' +
            ' active map items',
          () => {
            actions$ = of(ShareLinkActions.validateItem({item: expectedItem}));
            const drawingActiveMapItems = expectedCompleteItem.drawings.map(() =>
              ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, DrawingLayerPrefix.Drawing),
            );
            favouriteServiceMock.getDrawingsForFavourite.mockReturnValue(
              Promise.resolve({
                drawingsToAdd: expectedCompleteItem.drawings,
                drawingActiveMapItems: drawingActiveMapItems,
              }),
            );

            const expectedAction = ShareLinkActions.completeValidation({
              mapRestoreItem: {
                ...expectedCompleteItem,
                activeMapItems: [...drawingActiveMapItems, ...expectedCompleteItem.activeMapItems],
              },
            });

            effects.validateShareLinkItem$.subscribe((action) => {
              expect(favouriteServiceMock.getActiveMapItemsForFavourite).toHaveBeenCalledTimes(1);
              expect(favouriteServiceMock.getActiveMapItemsForFavourite).toHaveBeenCalledWith(expectedItem.content, false);
              expect(favouriteServiceMock.getDrawingsForFavourite).toHaveBeenCalledTimes(1);
              expect(favouriteServiceMock.getDrawingsForFavourite).toHaveBeenCalledWith(expectedItem.drawings, expectedItem.measurements);
              expect(action).toEqual(expectedAction);
            });
          },
        );

        it('dispatches ShareLinkActions.setValidationError() with the error on basemap validation failure', () => {
          const faultyItem: ShareLinkItem = {
            ...shareLinkItemMock,
            basemapId: 'there-is-no-map',
          };
          const expectedError = new ShareLinkPropertyCouldNotBeValidated(`Basemap ist ungültig: '${faultyItem.basemapId}'`);
          actions$ = of(ShareLinkActions.validateItem({item: faultyItem}));

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.setValidationError({error: expectedError}));
          });
        });

        it('dispatches ShareLinkActions.setValidationError() with the error on scale validation failure', () => {
          const faultyItem: ShareLinkItem = {
            ...shareLinkItemMock,
            scale: -1337,
          };
          const expectedError = new ShareLinkPropertyCouldNotBeValidated(`Massstab ist ungültig: '${faultyItem.scale}'`);
          actions$ = of(ShareLinkActions.validateItem({item: faultyItem}));

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.setValidationError({error: expectedError}));
          });
        });

        it('dispatches ShareLinkActions.setValidationError() with the error on active map items validation failure', () => {
          actions$ = of(ShareLinkActions.validateItem({item: expectedItem}));
          const favouriteServiceMockSpy = favouriteServiceMock.getActiveMapItemsForFavourite.mockImplementation(() => {
            throw expectedOriginalError;
          });

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(favouriteServiceMockSpy).toHaveBeenCalledTimes(1);
            expect(favouriteServiceMockSpy).toHaveBeenCalledWith(expectedItem.content, false);
            expect(action).toEqual(ShareLinkActions.setValidationError({error: expectedOriginalError}));
          });
        });
      });
    });

    describe('Action: setValidationError', () => {
      describe('handleValidationError$', () => {
        it('dispatches ShareLinkActions.setInitializationError() with the error on failure', () => {
          const expectedAction = ShareLinkActions.setInitializationError({error: expectedOriginalError});

          actions$ = of(ShareLinkActions.setValidationError({error: expectedOriginalError}));
          effects.handleValidationError$.subscribe((action) => {
            expect(action).toEqual(expectedAction);
          });
        });
      });
    });

    describe('Action: setInitializationError', () => {
      describe('throwInitializationError$', () => {
        it('throws a ShareLinkCouldNotBeValidated error with the login reminder and dispatches ShareLinkActions.setInitializationError() with the error on failure', () => {
          const isAuthenticated = true;
          store.overrideSelector(selectIsAuthenticated, isAuthenticated);

          const expectedError = new ShareLinkCouldNotBeValidated(isAuthenticated, expectedOriginalError);

          actions$ = of(ShareLinkActions.setInitializationError({error: expectedOriginalError}));
          effects.throwInitializationError$
            .pipe(
              catchError((error: unknown) => {
                expect(error).toEqual(expectedError);
                expect(error).toBeInstanceOf(ShareLinkCouldNotBeValidated);
                expect((error as ShareLinkCouldNotBeValidated).message).not.toContain('Möglicherweise hilft es, wenn Sie sich einloggen.');
                return EMPTY;
              }),
            )
            .subscribe();
        });

        it('throws a ShareLinkCouldNotBeValidated error without the login reminder and dispatches ShareLinkActions.setInitializationError() with the error on failure', () => {
          const isAuthenticated = false;
          store.overrideSelector(selectIsAuthenticated, isAuthenticated);

          const expectedError = new ShareLinkCouldNotBeValidated(isAuthenticated, expectedOriginalError);

          actions$ = of(ShareLinkActions.setInitializationError({error: expectedOriginalError}));
          effects.throwInitializationError$
            .pipe(
              catchError((error: unknown) => {
                expect(error).toEqual(expectedError);
                expect(error).toBeInstanceOf(ShareLinkCouldNotBeValidated);
                expect((error as ShareLinkCouldNotBeValidated).message).toContain('Möglicherweise hilft es, wenn Sie sich einloggen.');
                return EMPTY;
              }),
            )
            .subscribe();
        });
      });
    });

    describe('Action: completeValidation', () => {
      beforeEach(() => {
        actions$ = of(ShareLinkActions.completeValidation({mapRestoreItem: expectedCompleteItem}));
      });

      describe('setMapConfigAfterValidation$', () => {
        it('dispatches MapConfigActions.setInitialMapConfig() with the service response on success', () => {
          const expectedInitialMapConfig = {
            x: expectedCompleteItem.x,
            y: expectedCompleteItem.y,
            scale: expectedCompleteItem.scale,
            basemapId: expectedCompleteItem.basemapId,
            initialMaps: [],
          };

          effects.setMapConfigAfterValidation$.subscribe((action) => {
            expect(action).toEqual(MapConfigActions.setInitialMapConfig(expectedInitialMapConfig));
          });
        });
      });

      describe('setActiveMapItemsAfterValidation$', () => {
        it('dispatches ActiveMapItemActions.initializeActiveMapItems() with the service response on success', () => {
          const expectedActiveMapItems = {
            initialMapItems: expectedCompleteItem.activeMapItems,
          };
          const expectedAction = ActiveMapItemActions.addInitialMapItems(expectedActiveMapItems);

          effects.setActiveMapItemsAfterValidation$.subscribe((action) => {
            expect(action).toEqual(expectedAction);
          });
        });
      });

      describe('setInitialDrawingsAfterValidation$', () => {
        it('dispatches DrawingActions.addDrawings() with the correct drawings', () => {
          const drawings = {
            drawings: expectedCompleteItem.drawings,
          };

          effects.setInitialDrawingsAfterValidation$.subscribe((action) => {
            expect(action).toEqual(DrawingActions.addDrawings(drawings));
          });
        });
      });

      describe('completeInitialization$', () => {
        it('dispatches ShareLinkActions.completeApplicationInitialization() after the ActiveMapItems and drawings have been set', () => {
          store.overrideSelector(selectItems, expectedCompleteItem.activeMapItems);
          store.overrideSelector(selectDrawings, expectedCompleteItem.drawings);

          effects.completeInitialization$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.completeApplicationInitialization());
          });
        });
      });
    });
  });
});
