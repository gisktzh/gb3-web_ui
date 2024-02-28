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
import {MapConfigActions} from '../actions/map-config.actions';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {selectItems} from '../reducers/active-map-item.reducer';
import {ActiveMapItemConfiguration} from '../../../shared/interfaces/active-map-item-configuration.interface';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {Gb3VectorLayer} from '../../../shared/interfaces/gb3-vector-layer.interface';
import {selectDrawings} from '../reducers/drawing.reducer';
import {DrawingActions} from '../actions/drawing.actions';
import {Gb3StyledInternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {selectIsAuthenticated} from '../../auth/reducers/auth-status.reducer';
import {MapRestoreItem} from '../../../shared/interfaces/map-restore-item.interface';
import {TimeExtentUtils} from '../../../shared/utils/time-extent.utils';

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
        timeExtent: {start: TimeExtentUtils.getUTCDate('1000'), end: TimeExtentUtils.getUTCDate('2020')},
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

  beforeEach(() => {
    actions$ = new Observable<Action>();
    favouriteServiceMock = jasmine.createSpyObj<FavouritesService>(['getActiveMapItemsForFavourite', 'getDrawingsForFavourite']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        ShareLinkEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: FavouritesService, useValue: favouriteServiceMock},
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
          catchError((error: unknown) => {
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
          catchError((error: unknown) => {
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
    const expectedCompleteItem: MapRestoreItem = {
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
            expect(action).toEqual(ShareLinkActions.validateItem({item: expectedItem}));
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

        it('dispatches ShareLinkActions.completeValidation() with the service response on success with no drawings', (done: DoneFn) => {
          actions$ = of(ShareLinkActions.validateItem({item: expectedItem}));
          favouriteServiceMock.getDrawingsForFavourite.and.returnValue({
            drawingsToAdd: [],
            drawingActiveMapItems: [],
          });

          const expectedAction = ShareLinkActions.completeValidation({mapRestoreItem: {...expectedCompleteItem, drawings: []}});

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(favouriteServiceMock.getActiveMapItemsForFavourite).toHaveBeenCalledOnceWith(expectedItem.content, false);
            expect(favouriteServiceMock.getDrawingsForFavourite).toHaveBeenCalledOnceWith(expectedItem.drawings, expectedItem.measurements);
            expect(action).toEqual(expectedAction);
            done();
          });
        });

        it(
          'dispatches ShareLinkActions.completeValidation() with the service response on success with drawings added on top of the' +
            ' active map items',
          (done: DoneFn) => {
            actions$ = of(ShareLinkActions.validateItem({item: expectedItem}));
            const drawingActiveMapItems = expectedCompleteItem.drawings.map((d) =>
              ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, d.source),
            );
            favouriteServiceMock.getDrawingsForFavourite.and.returnValue({
              drawingsToAdd: expectedCompleteItem.drawings,
              drawingActiveMapItems: drawingActiveMapItems,
            });

            const expectedAction = ShareLinkActions.completeValidation({
              mapRestoreItem: {
                ...expectedCompleteItem,
                activeMapItems: [...drawingActiveMapItems, ...expectedCompleteItem.activeMapItems],
              },
            });

            effects.validateShareLinkItem$.subscribe((action) => {
              expect(favouriteServiceMock.getActiveMapItemsForFavourite).toHaveBeenCalledOnceWith(expectedItem.content, false);
              expect(favouriteServiceMock.getDrawingsForFavourite).toHaveBeenCalledOnceWith(
                expectedItem.drawings,
                expectedItem.measurements,
              );
              expect(action).toEqual(expectedAction);
              done();
            });
          },
        );

        it('dispatches ShareLinkActions.setValidationError() with the error on basemap validation failure', (done: DoneFn) => {
          const faultyItem: ShareLinkItem = {
            ...shareLinkItemMock,
            basemapId: 'there-is-no-map',
          };
          const expectedError = new ShareLinkPropertyCouldNotBeValidated(`Basemap ist ungültig: '${faultyItem.basemapId}'`);
          actions$ = of(ShareLinkActions.validateItem({item: faultyItem}));

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
          actions$ = of(ShareLinkActions.validateItem({item: faultyItem}));

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.setValidationError({error: expectedError}));
            done();
          });
        });

        it('dispatches ShareLinkActions.setValidationError() with the error on active map items validation failure', (done: DoneFn) => {
          actions$ = of(ShareLinkActions.validateItem({item: expectedItem}));
          const favouriteServiceMockSpy = favouriteServiceMock.getActiveMapItemsForFavourite.and.throwError(expectedOriginalError);

          effects.validateShareLinkItem$.subscribe((action) => {
            expect(favouriteServiceMockSpy).toHaveBeenCalledOnceWith(expectedItem.content, false);
            expect(action).toEqual(ShareLinkActions.setValidationError({error: expectedOriginalError}));
            done();
          });
        });
      });
    });

    describe('Action: setValidationError', () => {
      describe('handleValidationError$', () => {
        it('dispatches ShareLinkActions.setInitializationError() with the error on failure', (done: DoneFn) => {
          const expectedAction = ShareLinkActions.setInitializationError({error: expectedOriginalError});

          actions$ = of(ShareLinkActions.setValidationError({error: expectedOriginalError}));
          effects.handleValidationError$.subscribe((action) => {
            expect(action).toEqual(expectedAction);
            done();
          });
        });
      });
    });

    describe('Action: setInitializationError', () => {
      describe('throwInitializationError$', () => {
        it('throws a ShareLinkCouldNotBeValidated error with the login reminder and dispatches ShareLinkActions.setInitializationError() with the error on failure', (done: DoneFn) => {
          const isAuthenticated = true;
          store.overrideSelector(selectIsAuthenticated, isAuthenticated);

          const expectedError = new ShareLinkCouldNotBeValidated(isAuthenticated, expectedOriginalError);

          actions$ = of(ShareLinkActions.setInitializationError({error: expectedOriginalError}));
          effects.throwInitializationError$
            .pipe(
              catchError((error) => {
                expect(error).toEqual(expectedError);
                expect(error).toBeInstanceOf(ShareLinkCouldNotBeValidated);
                expect((error as ShareLinkCouldNotBeValidated).message).not.toContain('Möglicherweise hilft es, wenn Sie sich einloggen.');
                done();
                return EMPTY;
              }),
            )
            .subscribe();
        });

        it('throws a ShareLinkCouldNotBeValidated error without the login reminder and dispatches ShareLinkActions.setInitializationError() with the error on failure', (done: DoneFn) => {
          const isAuthenticated = false;
          store.overrideSelector(selectIsAuthenticated, isAuthenticated);

          const expectedError = new ShareLinkCouldNotBeValidated(isAuthenticated, expectedOriginalError);

          actions$ = of(ShareLinkActions.setInitializationError({error: expectedOriginalError}));
          effects.throwInitializationError$
            .pipe(
              catchError((error) => {
                expect(error).toEqual(expectedError);
                expect(error).toBeInstanceOf(ShareLinkCouldNotBeValidated);
                expect((error as ShareLinkCouldNotBeValidated).message).toContain('Möglicherweise hilft es, wenn Sie sich einloggen.');
                done();
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
        it('dispatches MapConfigActions.setInitialMapConfig() with the service response on success', (done: DoneFn) => {
          const expectedInitialMapConfig = {
            x: expectedCompleteItem.x,
            y: expectedCompleteItem.y,
            scale: expectedCompleteItem.scale,
            basemapId: expectedCompleteItem.basemapId,
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
            initialMapItems: expectedCompleteItem.activeMapItems,
          };
          const expectedAction = ActiveMapItemActions.addInitialMapItems(expectedActiveMapItems);

          effects.setActiveMapItemsAfterValidation$.subscribe((action) => {
            expect(action).toEqual(expectedAction);
            done();
          });
        });
      });

      describe('setInitialDrawingsAfterValidation$', () => {
        it('dispatches DrawingActions.addDrawings() with the correct drawings', (done: DoneFn) => {
          const drawings = {
            drawings: expectedCompleteItem.drawings,
          };

          effects.setInitialDrawingsAfterValidation$.subscribe((action) => {
            expect(action).toEqual(DrawingActions.addDrawings(drawings));
            done();
          });
        });
      });

      describe('completeInitialization$', () => {
        it('dispatches ShareLinkActions.completeApplicationInitialization() after the ActiveMapItems and drawings have been set', (done: DoneFn) => {
          store.overrideSelector(selectItems, expectedCompleteItem.activeMapItems);
          store.overrideSelector(selectDrawings, expectedCompleteItem.drawings);

          effects.completeInitialization$.subscribe((action) => {
            expect(action).toEqual(ShareLinkActions.completeApplicationInitialization());
            done();
          });
        });
      });
    });
  });
});
