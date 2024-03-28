import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {CantonCouldNotBeLoaded, MunicipalitiesCouldNotBeLoaded} from '../../../shared/errors/data-download.errors';
import {CantonWithGeometry, Municipality} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {DataDownloadRegionEffects} from './data-download-region.effects';
import {Gb3GeoshopCantonService} from '../../../shared/services/apis/gb3/gb3-geoshop-canton.service';
import {Gb3GeoshopMunicipalitiesService} from '../../../shared/services/apis/gb3/gb3-geoshop-municipalities.service';
import {DataDownloadRegionActions} from '../actions/data-download-region.actions';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {selectCanton, selectMunicipalities} from '../reducers/data-download-region.reducer';
import {catchError} from 'rxjs/operators';

describe('DataDownloadRegionEffects', () => {
  const errorMock = new Error('oh no! anyway...');

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataDownloadRegionEffects;
  let geoshopCantonService: Gb3GeoshopCantonService;
  let geoshopMunicipalitiesService: Gb3GeoshopMunicipalitiesService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DataDownloadRegionEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    effects = TestBed.inject(DataDownloadRegionEffects);
    geoshopCantonService = TestBed.inject(Gb3GeoshopCantonService);
    geoshopMunicipalitiesService = TestBed.inject(Gb3GeoshopMunicipalitiesService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
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
