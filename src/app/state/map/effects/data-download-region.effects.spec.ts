import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {
  CantonCouldNotBeLoaded,
  FederationCouldNotBeLoaded,
  MunicipalitiesCouldNotBeLoaded,
} from '../../../shared/errors/data-download.errors';
import {CantonWithGeometry, FederationWithGeometry, Municipality} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {DataDownloadRegionEffects} from './data-download-region.effects';
import {Gb3GeoshopCantonService} from '../../../shared/services/apis/gb3/gb3-geoshop-canton.service';
import {Gb3GeoshopMunicipalitiesService} from '../../../shared/services/apis/gb3/gb3-geoshop-municipalities.service';
import {DataDownloadRegionActions} from '../actions/data-download-region.actions';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {selectCanton, selectFederation, selectMunicipalities} from '../reducers/data-download-region.reducer';
import {catchError} from 'rxjs/operators';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {Gb3GeoshopFederationService} from '../../../shared/services/apis/gb3/gb3-geoshop-federation.service';

describe('DataDownloadRegionEffects', () => {
  const errorMock = new Error('oh no! anyway...');

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataDownloadRegionEffects;
  let geoshopFederationService: Gb3GeoshopFederationService;
  let geoshopCantonService: Gb3GeoshopCantonService;
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
    geoshopFederationService = TestBed.inject(Gb3GeoshopFederationService);
    geoshopCantonService = TestBed.inject(Gb3GeoshopCantonService);
    geoshopMunicipalitiesService = TestBed.inject(Gb3GeoshopMunicipalitiesService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('loadFederation$', () => {
    it('dispatches DataDownloadRegionActions.setFederation() after loading the federation successfully', (done: DoneFn) => {
      const federation: FederationWithGeometry = {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)};
      store.overrideSelector(selectFederation, undefined);
      const geoshopFederationServiceSpy = spyOn(geoshopFederationService, 'loadFederation').and.returnValue(of(federation));

      const expectedAction = DataDownloadRegionActions.setFederation({federation});

      actions$ = of(DataDownloadRegionActions.loadFederation());
      effects.loadFederation$.subscribe((action) => {
        expect(geoshopFederationServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches DataDownloadRegionActions.setFederationError() after loading the federation unsuccessfully', (done: DoneFn) => {
      const error = errorMock;
      store.overrideSelector(selectFederation, undefined);
      const geoshopFederationServiceSpy = spyOn(geoshopFederationService, 'loadFederation').and.returnValue(throwError(() => error));

      const expectedAction = DataDownloadRegionActions.setFederationError({error});

      actions$ = of(DataDownloadRegionActions.loadFederation());
      effects.loadFederation$.subscribe((action) => {
        expect(geoshopFederationServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches nothing if the federation is already in the store', fakeAsync(async () => {
      const federation: FederationWithGeometry = {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)};
      store.overrideSelector(selectFederation, federation);
      const geoshopFederationServiceSpy = spyOn(geoshopFederationService, 'loadFederation').and.callThrough();

      let newAction;
      actions$ = of(DataDownloadRegionActions.loadFederation());
      effects.loadFederation$.subscribe((action) => (newAction = action));
      flush();

      expect(geoshopFederationServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();
    }));
  });

  describe('throwFederationError$', () => {
    it('throws a FederationCouldNotBeLoaded error after setting a federation error', (done: DoneFn) => {
      const error = errorMock;

      const expectedError = new FederationCouldNotBeLoaded(error);

      actions$ = of(DataDownloadRegionActions.setFederationError({error}));
      effects.throwFederationError$
        .pipe(
          catchError((e: unknown) => {
            expect(e).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('loadCanton$', () => {
    it('dispatches DataDownloadRegionActions.setCanton() after loading the canton successfully', (done: DoneFn) => {
      const canton: CantonWithGeometry = {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)};
      store.overrideSelector(selectCanton, undefined);
      const geoshopCantonServiceSpy = spyOn(geoshopCantonService, 'loadCanton').and.returnValue(of(canton));

      const expectedAction = DataDownloadRegionActions.setCanton({canton});

      actions$ = of(DataDownloadRegionActions.loadCanton());
      effects.loadCanton$.subscribe((action) => {
        expect(geoshopCantonServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches DataDownloadRegionActions.setCantonError() after loading the canton unsuccessfully', (done: DoneFn) => {
      const error = errorMock;
      store.overrideSelector(selectCanton, undefined);
      const geoshopCantonServiceSpy = spyOn(geoshopCantonService, 'loadCanton').and.returnValue(throwError(() => error));

      const expectedAction = DataDownloadRegionActions.setCantonError({error});

      actions$ = of(DataDownloadRegionActions.loadCanton());
      effects.loadCanton$.subscribe((action) => {
        expect(geoshopCantonServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches nothing if the canton is already in the store', fakeAsync(async () => {
      const canton: CantonWithGeometry = {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)};
      store.overrideSelector(selectCanton, canton);
      const geoshopCantonServiceSpy = spyOn(geoshopCantonService, 'loadCanton').and.callThrough();

      let newAction;
      actions$ = of(DataDownloadRegionActions.loadCanton());
      effects.loadCanton$.subscribe((action) => (newAction = action));
      flush();

      expect(geoshopCantonServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();
    }));
  });

  describe('throwCantonError$', () => {
    it('throws a CantonCouldNotBeLoaded error after setting a canton error', (done: DoneFn) => {
      const error = errorMock;

      const expectedError = new CantonCouldNotBeLoaded(error);

      actions$ = of(DataDownloadRegionActions.setCantonError({error}));
      effects.throwCantonError$
        .pipe(
          catchError((e: unknown) => {
            expect(e).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('loadMunicipalities$', () => {
    it('dispatches DataDownloadRegionActions.setMunicipalities() after loading the municipalities successfully', (done: DoneFn) => {
      const municipalities: Municipality[] = [{name: 'Leethausen', bfsNo: 1337}];
      store.overrideSelector(selectMunicipalities, []);
      const geoshopMunicipalitiesServiceSpy = spyOn(geoshopMunicipalitiesService, 'loadMunicipalities').and.returnValue(of(municipalities));

      const expectedAction = DataDownloadRegionActions.setMunicipalities({municipalities});

      actions$ = of(DataDownloadRegionActions.loadMunicipalities());
      effects.loadMunicipalities$.subscribe((action) => {
        expect(geoshopMunicipalitiesServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches DataDownloadRegionActions.setMunicipalitiesError() after loading the municipalities unsuccessfully', (done: DoneFn) => {
      const error = new Error('oh no! anyway...');
      store.overrideSelector(selectMunicipalities, []);
      const geoshopMunicipalitiesServiceSpy = spyOn(geoshopMunicipalitiesService, 'loadMunicipalities').and.returnValue(
        throwError(() => error),
      );

      const expectedAction = DataDownloadRegionActions.setMunicipalitiesError({error});

      actions$ = of(DataDownloadRegionActions.loadMunicipalities());
      effects.loadMunicipalities$.subscribe((action) => {
        expect(geoshopMunicipalitiesServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches nothing if the municipalities is already in the store', fakeAsync(async () => {
      const municipalities: Municipality[] = [{name: 'Leethausen', bfsNo: 1337}];
      store.overrideSelector(selectMunicipalities, municipalities);
      const geoshopMunicipalitiesServiceSpy = spyOn(geoshopMunicipalitiesService, 'loadMunicipalities').and.callThrough();

      let newAction;
      actions$ = of(DataDownloadRegionActions.loadMunicipalities());
      effects.loadMunicipalities$.subscribe((action) => (newAction = action));
      flush();

      expect(geoshopMunicipalitiesServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();
    }));
  });

  describe('throwMunicipalitiesError$', () => {
    it('throws a MunicipalitiesCouldNotBeLoaded error after setting a municipalities error', (done: DoneFn) => {
      const error = new Error('oh no! anyway...');

      const expectedError = new MunicipalitiesCouldNotBeLoaded(error);

      actions$ = of(DataDownloadRegionActions.setMunicipalitiesError({error}));
      effects.throwMunicipalitiesError$
        .pipe(
          catchError((e: unknown) => {
            expect(e).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
