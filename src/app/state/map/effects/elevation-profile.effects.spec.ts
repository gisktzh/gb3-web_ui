import type {Mock} from 'vitest';
import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ElevationProfileEffects} from './elevation-profile.effects';
import {ToolActions} from '../actions/tool.actions';
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
import {MAP_SERVICE} from '../../../app.tokens';

describe('ElevationProfileEffects', () => {
  let actions$: Observable<Action>;
  let effects: ElevationProfileEffects;
  let mapService: MapService;
  let mapServiceSpy: Mock;
  let mapDrawingService: MapDrawingService;
  let mapDrawingServiceSpy: Mock;
  let swisstopoApiService: SwisstopoApiService;
  let swisstopoApiServiceSpy: Mock;
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
    it('does nothing for other tools', async () => {
      vi.useFakeTimers();

      actions$ = of(ToolActions.activateTool({tool: 'measure-line'}));

      effects.clearExistingElevationProfilesOnNew$.subscribe();
      await vi.runAllTimersAsync();

      actions$.subscribe((action) => expect(action).toEqual(ToolActions.activateTool({tool: 'measure-line'})));

      vi.useRealTimers();
    });

    it('dispatches ElevationProfileActions.clearProfile', () => {
      actions$ = of(ToolActions.activateTool({tool: 'measure-elevation-profile'}));

      effects.clearExistingElevationProfilesOnNew$.subscribe((action) => {
        expect(action).toEqual(ElevationProfileActions.clearProfile());
      });
    });
  });

  describe('clearExistingElevationProfileOnClose$', () => {
    it('does nothing if elevation profile is being set to visible', async () => {
      vi.useFakeTimers();

      actions$ = of(MapUiActions.setElevationProfileOverlayVisibility({isVisible: true}));

      effects.clearExistingElevationProfileOnClose$.subscribe();
      await vi.runAllTimersAsync();

      actions$.subscribe((action) => expect(action).toEqual(MapUiActions.setElevationProfileOverlayVisibility({isVisible: true})));

      vi.useRealTimers();
    });

    it('dispatches ElevationProfileActions.clearProfile if is set to invisible', () => {
      actions$ = of(MapUiActions.setElevationProfileOverlayVisibility({isVisible: false}));

      effects.clearExistingElevationProfileOnClose$.subscribe((action) => {
        expect(action).toEqual(ElevationProfileActions.clearProfile());
      });
    });
  });

  describe('clearExistingElevationProfileOnMapUiReset$', () => {
    it('dispatches ElevationProfileActions.clearProfile if mapUi is reset and elevationProfileData is not undefined', () => {
      store.overrideSelector(selectData, {
        dataPoints: [{altitude: 1, distance: 250, location: {type: 'Point', coordinates: [1, 2], srs: 2056}}],
        statistics: {groundDistance: 666, linearDistance: 42, elevationDifference: 1337, lowestPoint: 9000, highestPoint: 9001},
        csvRequest: {url: '', params: new URLSearchParams()},
      });
      actions$ = of(MapUiActions.resetMapUiState());

      effects.clearExistingElevationProfileOnMapUiReset$.subscribe((action) => {
        expect(action).toEqual(ElevationProfileActions.clearProfile());
      });
    });

    it('does nothing if elevationProfileData is undefined', async () => {
      vi.useFakeTimers();

      store.overrideSelector(selectData, undefined);
      actions$ = of(MapUiActions.resetMapUiState());

      effects.clearExistingElevationProfileOnMapUiReset$.subscribe();
      await vi.runAllTimersAsync();

      actions$.subscribe((action) => expect(action).toEqual(MapUiActions.resetMapUiState()));

      vi.useRealTimers();
    });
  });

  describe('requestElevationProfile$', () => {
    it('calls the swisstopo API and returns the data', () => {
      const mockData: ElevationProfileData = {
        dataPoints: [{altitude: 1, distance: 250, location: {type: 'Point', coordinates: [1, 2], srs: 2056}}],
        statistics: {groundDistance: 666, linearDistance: 42, elevationDifference: 1337, lowestPoint: 9000, highestPoint: 9001},
        csvRequest: {url: '', params: new URLSearchParams()},
      };
      const mockGeometry = MinimalGeometriesUtils.getMinimalLineString(2056);
      swisstopoApiServiceSpy = vi.spyOn(swisstopoApiService, 'loadElevationProfile').mockReturnValue(of(mockData));
      actions$ = of(ElevationProfileActions.loadProfile({geometry: mockGeometry}));

      effects.requestElevationProfile$.subscribe((action) => {
        expect(swisstopoApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(swisstopoApiServiceSpy).toHaveBeenCalledWith(mockGeometry);
        expect(action).toEqual(ElevationProfileActions.setProfile({data: mockData}));
      });
    });

    it('dispatches ElevationProfileActions.setError on API error', () => {
      const mockGeometry = MinimalGeometriesUtils.getMinimalLineString(2056);
      const expectedError = new Error('oh no! butterfingers');
      swisstopoApiServiceSpy = vi.spyOn(swisstopoApiService, 'loadElevationProfile').mockReturnValue(throwError(() => expectedError));
      actions$ = of(ElevationProfileActions.loadProfile({geometry: mockGeometry}));

      effects.requestElevationProfile$.subscribe((action) => {
        expect(swisstopoApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(swisstopoApiServiceSpy).toHaveBeenCalledWith(mockGeometry);
        expect(action).toEqual(ElevationProfileActions.setProfileError({error: expectedError}));
      });
    });
  });

  describe('setElevationProfileError$', () => {
    it('throws a ElevationProfileCouldNotBeLoaded error', () => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(ElevationProfileActions.setProfileError({error: expectedOriginalError}));
      effects.setElevationProfileError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new ElevationProfileCouldNotBeLoaded(expectedOriginalError);
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('resetProfileDrawing$', () => {
    it('clears the drawing layer, does not dispatch', () => {
      mapServiceSpy = vi.spyOn(mapService, 'clearInternalDrawingLayer');

      actions$ = of(ElevationProfileActions.clearProfile());

      effects.resetProfileDrawing$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapServiceSpy).toHaveBeenCalledWith(InternalDrawingLayer.ElevationProfile);
        expect(action).toEqual(ElevationProfileActions.clearProfile());
      });
    });
  });

  describe('drawElevationProfileLocation$', () => {
    it('calls MapDrawingService.drawElevationProfileHoverLocation, does not dispatch', () => {
      const mockLocation: PointWithSrs = {type: 'Point', coordinates: [1, 2], srs: 2056};
      mapDrawingServiceSpy = vi.spyOn(mapDrawingService, 'drawElevationProfileHoverLocation');

      actions$ = of(ElevationProfileActions.drawElevationProfileHoverLocation({location: mockLocation}));

      effects.drawElevationProfileLocation$.subscribe((action) => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapDrawingServiceSpy).toHaveBeenCalledWith(mockLocation);
        expect(action).toEqual(ElevationProfileActions.drawElevationProfileHoverLocation({location: mockLocation}));
      });
    });
  });

  describe('removeElevationProfileLocation$', () => {
    it('calls MapDrawingService.removeElevationProfileHoverLocation, does not dispatch', () => {
      mapDrawingServiceSpy = vi.spyOn(mapDrawingService, 'removeElevationProfileHoverLocation');

      actions$ = of(ElevationProfileActions.removeElevationProfileHoverLocation());

      effects.removeElevationProfileLocation$.subscribe((action) => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapDrawingServiceSpy).toHaveBeenCalledWith();
        expect(action).toEqual(ElevationProfileActions.removeElevationProfileHoverLocation());
      });
    });
  });
});
