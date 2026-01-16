import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ExportEffects} from './export.effects';
import {Gb3ExportService} from '../../../shared/services/apis/gb3/gb3-export.service';
import {TestBed} from '@angular/core/testing';
import {UserDrawingVectorLayers} from '../../../shared/interfaces/user-drawing-vector-layers.interface';
import {DrawingCouldNotBeExported} from '../../../shared/errors/export.errors';
import {catchError} from 'rxjs';
import {ExportActions} from '../actions/export.actions';
import {provideMockActions} from '@ngrx/effects/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {selectUserDrawingsVectorLayers} from '../selectors/user-drawings-vector-layers.selector';
import {ExportFormat} from '../../../shared/enums/export-format.enum';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {Gb3StyledInternalDrawingRepresentation} from 'src/app/shared/interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from 'src/app/shared/enums/drawing-layer.enum';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolServiceStub} from 'src/app/testing/map-testing/drawing-symbol-service.stub';
import {UuidUtils} from 'src/app/shared/utils/uuid.utils';

describe('ExportEffects', () => {
  const mockUuid = '4fce85dd-3e65-4b9d-851c-6a4b4d1db154'; // Chosen by fair dice roll

  const mockDrawings: {drawings: Gb3StyledInternalDrawingRepresentation[]; measurements: Gb3StyledInternalDrawingRepresentation[]} = {
    drawings: [
      {
        source: UserDrawingLayer.Drawings,
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
          srs: 2056,
        },
        properties: {
          // eslint-disable-next-line @typescript-eslint/naming-convention -- necessary because of type
          __id: 'test',
          // eslint-disable-next-line @typescript-eslint/naming-convention -- necessary because of type
          __tool: 'point',
          // eslint-disable-next-line @typescript-eslint/naming-convention -- necessary because of type
          __belongsTo: 'yes',
          style: {
            type: 'line',
            strokeColor: '',
            strokeOpacity: 0,
            strokeWidth: 0,
          },
        },
      },
    ],
    measurements: [
      {
        source: UserDrawingLayer.Measurements,
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
          srs: 2056,
        },
        properties: {
          // eslint-disable-next-line @typescript-eslint/naming-convention -- necessary because of type
          __id: '2',
          // eslint-disable-next-line @typescript-eslint/naming-convention -- necessary because of type
          __tool: 'point',
          // eslint-disable-next-line @typescript-eslint/naming-convention -- necessary because of type
          __belongsTo: 'yes',
          style: {
            type: 'line',
            strokeColor: '',
            strokeOpacity: 0,
            strokeWidth: 0,
          },
        },
      },
    ],
  };

  const mockUserDrawingsVectorLayer: UserDrawingVectorLayers = {
    drawings: {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              id: 'test',
              style: mockUuid,
              tool: 'point',
              belongsTo: 'yes',
              text: undefined,
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
          },
        ],
      },
      styles: {
        [mockUuid]: {
          type: 'line',
          strokeColor: '',
          strokeOpacity: 0,
          strokeWidth: 0,
        },
      },
    },

    measurements: {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              id: '2',
              style: mockUuid,
              tool: 'point',
              belongsTo: 'yes',
              text: undefined,
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
          },
        ],
      },
      styles: {
        [mockUuid]: {
          type: 'line',
          strokeColor: '',
          strokeOpacity: 0,
          strokeWidth: 0,
        },
      },
    },
  };

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: ExportEffects;
  let gb3ExportService: Gb3ExportService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ExportEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: DRAWING_SYMBOLS_SERVICE, useClass: DrawingSymbolServiceStub},
      ],
    });
    effects = TestBed.inject(ExportEffects);
    gb3ExportService = TestBed.inject(Gb3ExportService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('requestExportDrawings$', () => {
    it('dispatches ExportActions.setExportDrawingsRequestResponse()', (done: DoneFn) => {
      const expectedFormat: ExportFormat = ExportFormat.Geojson;
      const gb3ExportServiceSpy = spyOn(gb3ExportService, 'exportDrawing').and.returnValue(of(new Blob()));
      spyOn(UuidUtils, 'createUuid').and.returnValue(mockUuid);

      store.overrideSelector(selectUserDrawingsVectorLayers, mockDrawings);
      actions$ = of(ExportActions.requestDrawingsExport({exportFormat: expectedFormat}));
      effects.requestExportDrawings$.subscribe((action) => {
        expect(gb3ExportServiceSpy).toHaveBeenCalledOnceWith(expectedFormat, mockUserDrawingsVectorLayer.drawings);
        expect(action).toEqual(ExportActions.setDrawingsExportRequestResponse());
        done();
      });
    });

    it('dispatches ExportActions.setExportDrawingsRequestError() on error', (done: DoneFn) => {
      const expectedFormat: ExportFormat = ExportFormat.Geojson;
      const expectedError = new Error('oh no! butterfingers');
      const gb3ExportServiceSpy = spyOn(gb3ExportService, 'exportDrawing').and.returnValue(throwError(() => expectedError));
      spyOn(UuidUtils, 'createUuid').and.returnValue(mockUuid);

      store.overrideSelector(selectUserDrawingsVectorLayers, mockDrawings);
      actions$ = of(ExportActions.requestDrawingsExport({exportFormat: expectedFormat}));
      effects.requestExportDrawings$.subscribe((action) => {
        expect(gb3ExportServiceSpy).toHaveBeenCalledOnceWith(expectedFormat, mockUserDrawingsVectorLayer.drawings);
        expect(action).toEqual(ExportActions.setDrawingsExportRequestError({error: expectedError}));
        done();
      });
    });
  });
  describe('throwExportDrawingsRequestError$', () => {
    it('throws a DrawingCouldNotBeExported error', (done: DoneFn) => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(ExportActions.setDrawingsExportRequestError({error: expectedOriginalError}));
      effects.throwExportDrawingsRequestError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new DrawingCouldNotBeExported(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
