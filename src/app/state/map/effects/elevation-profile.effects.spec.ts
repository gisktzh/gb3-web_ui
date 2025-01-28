import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ElevationProfileEffects} from './elevation-profile.effects';
import {ToolActions} from '../actions/tool.actions';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {MapService} from '../../../map/interfaces/map.service';
import {ElevationProfileActions} from '../actions/elevation-profile.actions';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {MapUiActions} from '../actions/map-ui.actions';
import {SwisstopoApiService} from '../../../shared/services/apis/swisstopo/swisstopo-api.service';
import {ElevationProfileData} from '../../../shared/interfaces/elevation-profile.interface';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {catchError} from 'rxjs';
import {ElevationProfileCouldNotBeLoaded} from '../../../shared/errors/elevation-profile.errors';
import {selectData} from '../reducers/elevation-profile.reducer';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('ElevationProfileEffects', () => {
  let actions$: Observable<Action>;
  let effects: ElevationProfileEffects;
  let mapService: MapService;
  let mapServiceSpy: jasmine.Spy;
  let mapDrawingService: MapDrawingService;
  let mapDrawingServiceSpy: jasmine.Spy;
  let swisstopoApiService: SwisstopoApiService;
  let swisstopoApiServiceSpy: jasmine.Spy;
  let store: MockStore;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ElevationProfileEffects,
        SwisstopoApiService,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        MapDrawingService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(ElevationProfileEffects);
    store = TestBed.inject(MockStore);
    mapService = TestBed.inject(MAP_SERVICE);
    swisstopoApiService = TestBed.inject(SwisstopoApiService);
    mapDrawingService = TestBed.inject(MapDrawingService);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('clearExistingElevationProfilesOnNew$', () => {
    it('does nothing for other tools', fakeAsync(() => {
      actions$ = of(ToolActions.activateTool({tool: 'measure-line'}));

      effects.clearExistingElevationProfilesOnNew$.subscribe();
      tick();

      actions$.subscribe((action) => expect(action).toEqual(ToolActions.activateTool({tool: 'measure-line'})));
    }));

    it('dispatches ElevationProfileActions.clearProfile', (done: DoneFn) => {
      actions$ = of(ToolActions.activateTool({tool: 'measure-elevation-profile'}));

      effects.clearExistingElevationProfilesOnNew$.subscribe((action) => {
        expect(action).toEqual(ElevationProfileActions.clearProfile());
        done();
      });
    });
  });

  describe('clearExistingElevationProfileOnClose$', () => {
    it('does nothing if elevation profile is being set to visible', fakeAsync(() => {
      actions$ = of(MapUiActions.setElevationProfileOverlayVisibility({isVisible: true}));

      effects.clearExistingElevationProfileOnClose$.subscribe();
      tick();

      actions$.subscribe((action) => expect(action).toEqual(MapUiActions.setElevationProfileOverlayVisibility({isVisible: true})));
    }));

    it('dispatches ElevationProfileActions.clearProfile if is set to invisible', (done: DoneFn) => {
      actions$ = of(MapUiActions.setElevationProfileOverlayVisibility({isVisible: false}));

      effects.clearExistingElevationProfileOnClose$.subscribe((action) => {
        expect(action).toEqual(ElevationProfileActions.clearProfile());
        done();
      });
    });
  });

  describe('clearExistingElevationProfileOnMapUiReset$', () => {
    it('dispatches ElevationProfileActions.clearProfile if mapUi is reset and elevationProfileData is not undefined', (done: DoneFn) => {
      store.overrideSelector(selectData, {
        dataPoints: [{altitude: 1, distance: 250, location: {type: 'Point', coordinates: [1, 2], srs: 2056}}],
        statistics: {groundDistance: 666, linearDistance: 42, elevationDifference: 1337, lowestPoint: 9000, highestPoint: 9001},
        csvRequest: {url: '', params: new URLSearchParams()},
      });
      actions$ = of(MapUiActions.resetMapUiState());

      effects.clearExistingElevationProfileOnMapUiReset$.subscribe((action) => {
        expect(action).toEqual(ElevationProfileActions.clearProfile());
        done();
      });
    });

    it('does nothing if elevationProfileData is undefined', fakeAsync(() => {
      store.overrideSelector(selectData, undefined);
      actions$ = of(MapUiActions.resetMapUiState());

      effects.clearExistingElevationProfileOnMapUiReset$.subscribe();
      tick();

      actions$.subscribe((action) => expect(action).toEqual(MapUiActions.resetMapUiState()));
    }));
  });

  describe('requestElevationProfile$', () => {
    it('calls the swisstopo API and returns the data', (done: DoneFn) => {
      const mockData: ElevationProfileData = {
        dataPoints: [{altitude: 1, distance: 250, location: {type: 'Point', coordinates: [1, 2], srs: 2056}}],
        statistics: {groundDistance: 666, linearDistance: 42, elevationDifference: 1337, lowestPoint: 9000, highestPoint: 9001},
        csvRequest: {url: '', params: new URLSearchParams()},
      };
      const mockGeometry = MinimalGeometriesUtils.getMinimalLineString(2056);
      swisstopoApiServiceSpy = spyOn(swisstopoApiService, 'loadElevationProfile').and.returnValue(of(mockData));
      actions$ = of(ElevationProfileActions.loadProfile({geometry: mockGeometry}));

      effects.requestElevationProfile$.subscribe((action) => {
        expect(swisstopoApiServiceSpy).toHaveBeenCalledOnceWith(mockGeometry);
        expect(action).toEqual(ElevationProfileActions.setProfile({data: mockData}));
        done();
      });
    });

    it('dispatches ElevationProfileActions.setError on API error', (done: DoneFn) => {
      const mockGeometry = MinimalGeometriesUtils.getMinimalLineString(2056);
      const expectedError = new Error('oh no! butterfingers');
      swisstopoApiServiceSpy = spyOn(swisstopoApiService, 'loadElevationProfile').and.returnValue(throwError(() => expectedError));
      actions$ = of(ElevationProfileActions.loadProfile({geometry: mockGeometry}));

      effects.requestElevationProfile$.subscribe((action) => {
        expect(swisstopoApiServiceSpy).toHaveBeenCalledOnceWith(mockGeometry);
        expect(action).toEqual(ElevationProfileActions.setProfileError({error: expectedError}));
        done();
      });
    });
  });

  describe('setElevationProfileError$', () => {
    it('throws a ElevationProfileCouldNotBeLoaded error', (done: DoneFn) => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(ElevationProfileActions.setProfileError({error: expectedOriginalError}));
      effects.setElevationProfileError$
        .pipe(
          catchError((error) => {
            const expectedError = new ElevationProfileCouldNotBeLoaded(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('resetProfileDrawing$', () => {
    it('clears the drawing layer, does not dispatch', (done: DoneFn) => {
      mapServiceSpy = spyOn(mapService, 'clearInternalDrawingLayer');

      actions$ = of(ElevationProfileActions.clearProfile());

      effects.resetProfileDrawing$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(InternalDrawingLayer.ElevationProfile);
        expect(action).toEqual(ElevationProfileActions.clearProfile());
        done();
      });
    });
  });

  describe('drawElevationProfileLocation$', () => {
    it('calls MapDrawingService.drawElevationProfileHoverLocation, does not dispatch', (done: DoneFn) => {
      const mockLocation: PointWithSrs = {type: 'Point', coordinates: [1, 2], srs: 2056};
      mapDrawingServiceSpy = spyOn(mapDrawingService, 'drawElevationProfileHoverLocation');

      actions$ = of(ElevationProfileActions.drawElevationProfileHoverLocation({location: mockLocation}));

      effects.drawElevationProfileLocation$.subscribe((action) => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledOnceWith(mockLocation);
        expect(action).toEqual(ElevationProfileActions.drawElevationProfileHoverLocation({location: mockLocation}));
        done();
      });
    });
  });

  describe('removeElevationProfileLocation$', () => {
    it('calls MapDrawingService.removeElevationProfileHoverLocation, does not dispatch', (done: DoneFn) => {
      mapDrawingServiceSpy = spyOn(mapDrawingService, 'removeElevationProfileHoverLocation');

      actions$ = of(ElevationProfileActions.removeElevationProfileHoverLocation());

      effects.removeElevationProfileLocation$.subscribe((action) => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(ElevationProfileActions.removeElevationProfileHoverLocation());
        done();
      });
    });
  });
});
