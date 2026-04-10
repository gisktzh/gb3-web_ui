import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {
  CantonCouldNotBeLoaded,
  FederationCouldNotBeLoaded,
  MunicipalitiesCouldNotBeLoaded,
} from '../../../shared/errors/data-download.errors';
import {BoundingBoxWithGeometry, Municipality} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {DataDownloadRegionEffects} from './data-download-region.effects';
import {Gb3GeoshopBoundingBoxService} from '../../../shared/services/apis/gb3/gb3-geoshop-bounding-box.service';
import {Gb3GeoshopMunicipalitiesService} from '../../../shared/services/apis/gb3/gb3-geoshop-municipalities.service';
import {DataDownloadRegionActions} from '../actions/data-download-region.actions';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {selectCanton, selectFederation, selectMunicipalities} from '../reducers/data-download-region.reducer';
import {catchError} from 'rxjs';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {MAP_SERVICE} from '../../../app.tokens';

describe('DataDownloadRegionEffects', () => {
  const errorMock = new Error('oh no! anyway...');

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataDownloadRegionEffects;
  let geoshopBoundingBoxService: Gb3GeoshopBoundingBoxService;
  let geoshopMunicipalitiesService: Gb3GeoshopMunicipalitiesService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DataDownloadRegionEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(DataDownloadRegionEffects);
    geoshopBoundingBoxService = TestBed.inject(Gb3GeoshopBoundingBoxService);
    geoshopMunicipalitiesService = TestBed.inject(Gb3GeoshopMunicipalitiesService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('loadFederation$', () => {
    it('dispatches DataDownloadRegionActions.setFederation() after loading the federation successfully', () => {
      const federation: BoundingBoxWithGeometry = {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)};
      store.overrideSelector(selectFederation, undefined);
      const geoshopBoundingBoxServiceSpy = vi.spyOn(geoshopBoundingBoxService, 'load').mockReturnValue(of(federation));

      const expectedAction = DataDownloadRegionActions.setFederation({federation});

      actions$ = of(DataDownloadRegionActions.loadFederation());
      effects.loadFederation$.subscribe((action) => {
        expect(geoshopBoundingBoxServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopBoundingBoxServiceSpy).toHaveBeenCalledWith('CH');
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches DataDownloadRegionActions.setFederationError() after loading the federation unsuccessfully', () => {
      const error = errorMock;
      store.overrideSelector(selectFederation, undefined);
      const geoshopBoundingBoxServiceSpy = vi.spyOn(geoshopBoundingBoxService, 'load').mockReturnValue(throwError(() => error));

      const expectedAction = DataDownloadRegionActions.setFederationError({error});

      actions$ = of(DataDownloadRegionActions.loadFederation());
      effects.loadFederation$.subscribe((action) => {
        expect(geoshopBoundingBoxServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopBoundingBoxServiceSpy).toHaveBeenCalledWith('CH');
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches nothing if the federation is already in the store', async () => {
      vi.useFakeTimers();

      const federation: BoundingBoxWithGeometry = {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)};
      store.overrideSelector(selectFederation, federation);
      const geoshopBoundingBoxServiceSpy = vi.spyOn(geoshopBoundingBoxService, 'load');

      let newAction;
      actions$ = of(DataDownloadRegionActions.loadFederation());
      effects.loadFederation$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();

      expect(geoshopBoundingBoxServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('throwFederationError$', () => {
    it('throws a FederationCouldNotBeLoaded error after setting a federation error', () => {
      const error = errorMock;

      const expectedError = new FederationCouldNotBeLoaded(error);

      actions$ = of(DataDownloadRegionActions.setFederationError({error}));
      effects.throwFederationError$
        .pipe(
          catchError((e: unknown) => {
            expect(e).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('loadCanton$', () => {
    it('dispatches DataDownloadRegionActions.setCanton() after loading the canton successfully', () => {
      const canton: BoundingBoxWithGeometry = {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)};
      store.overrideSelector(selectCanton, undefined);
      const geoshopBoundingBoxServiceSpy = vi.spyOn(geoshopBoundingBoxService, 'load').mockReturnValue(of(canton));

      const expectedAction = DataDownloadRegionActions.setCanton({canton});

      actions$ = of(DataDownloadRegionActions.loadCanton());
      effects.loadCanton$.subscribe((action) => {
        expect(geoshopBoundingBoxServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopBoundingBoxServiceSpy).toHaveBeenCalledWith('ZH');
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches DataDownloadRegionActions.setCantonError() after loading the canton unsuccessfully', () => {
      const error = errorMock;
      store.overrideSelector(selectCanton, undefined);
      const geoshopBoundingBoxServiceSpy = vi.spyOn(geoshopBoundingBoxService, 'load').mockReturnValue(throwError(() => error));

      const expectedAction = DataDownloadRegionActions.setCantonError({error});

      actions$ = of(DataDownloadRegionActions.loadCanton());
      effects.loadCanton$.subscribe((action) => {
        expect(geoshopBoundingBoxServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopBoundingBoxServiceSpy).toHaveBeenCalledWith('ZH');
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches nothing if the canton is already in the store', async () => {
      vi.useFakeTimers();

      const canton: BoundingBoxWithGeometry = {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)};
      store.overrideSelector(selectCanton, canton);
      const geoshopBoundingBoxServiceSpy = vi.spyOn(geoshopBoundingBoxService, 'load');

      let newAction;
      actions$ = of(DataDownloadRegionActions.loadCanton());
      effects.loadCanton$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();

      expect(geoshopBoundingBoxServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('throwCantonError$', () => {
    it('throws a CantonCouldNotBeLoaded error after setting a canton error', () => {
      const error = errorMock;

      const expectedError = new CantonCouldNotBeLoaded(error);

      actions$ = of(DataDownloadRegionActions.setCantonError({error}));
      effects.throwCantonError$
        .pipe(
          catchError((e: unknown) => {
            expect(e).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('loadMunicipalities$', () => {
    it('dispatches DataDownloadRegionActions.setMunicipalities() after loading the municipalities successfully', () => {
      const municipalities: Municipality[] = [{name: 'Leethausen', bfsNo: 1337}];
      store.overrideSelector(selectMunicipalities, []);
      const geoshopMunicipalitiesServiceSpy = vi
        .spyOn(geoshopMunicipalitiesService, 'loadMunicipalities')
        .mockReturnValue(of(municipalities));

      const expectedAction = DataDownloadRegionActions.setMunicipalities({municipalities});

      actions$ = of(DataDownloadRegionActions.loadMunicipalities());
      effects.loadMunicipalities$.subscribe((action) => {
        expect(geoshopMunicipalitiesServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopMunicipalitiesServiceSpy).toHaveBeenCalledWith();
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches DataDownloadRegionActions.setMunicipalitiesError() after loading the municipalities unsuccessfully', () => {
      const error = new Error('oh no! anyway...');
      store.overrideSelector(selectMunicipalities, []);
      const geoshopMunicipalitiesServiceSpy = vi
        .spyOn(geoshopMunicipalitiesService, 'loadMunicipalities')
        .mockReturnValue(throwError(() => error));

      const expectedAction = DataDownloadRegionActions.setMunicipalitiesError({error});

      actions$ = of(DataDownloadRegionActions.loadMunicipalities());
      effects.loadMunicipalities$.subscribe((action) => {
        expect(geoshopMunicipalitiesServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopMunicipalitiesServiceSpy).toHaveBeenCalledWith();
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches nothing if the municipalities is already in the store', async () => {
      vi.useFakeTimers();

      const municipalities: Municipality[] = [{name: 'Leethausen', bfsNo: 1337}];
      store.overrideSelector(selectMunicipalities, municipalities);
      const geoshopMunicipalitiesServiceSpy = vi.spyOn(geoshopMunicipalitiesService, 'loadMunicipalities');

      let newAction;
      actions$ = of(DataDownloadRegionActions.loadMunicipalities());
      effects.loadMunicipalities$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();

      expect(geoshopMunicipalitiesServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('throwMunicipalitiesError$', () => {
    it('throws a MunicipalitiesCouldNotBeLoaded error after setting a municipalities error', () => {
      const error = new Error('oh no! anyway...');

      const expectedError = new MunicipalitiesCouldNotBeLoaded(error);

      actions$ = of(DataDownloadRegionActions.setMunicipalitiesError({error}));
      effects.throwMunicipalitiesError$
        .pipe(
          catchError((e: unknown) => {
            expect(e).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
