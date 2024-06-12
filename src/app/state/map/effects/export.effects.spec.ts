import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ExportEffects} from './export.effects';
import {Gb3ExportService} from '../../../shared/services/apis/gb3/gb3-export.service';
import {TestBed} from '@angular/core/testing';
import {UserDrawingVectorLayers} from '../../../shared/interfaces/user-drawing-vector-layers.interface';
import {DrawingCouldNotBeExported} from '../../../shared/errors/export.errors';
import {catchError} from 'rxjs/operators';
import {ExportActions} from '../actions/export.actions';
import {provideMockActions} from '@ngrx/effects/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {selectUserDrawingsVectorLayers} from '../selectors/user-drawings-vector-layers.selector';
import {ExportFormat} from '../../../shared/types/export-format.type';

describe('ExportEffects', () => {
  const mockDrawings: UserDrawingVectorLayers = {
    drawings: {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              id: 'test',
              style: 'style',
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
      styles: {},
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
              style: 'style2',
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
      styles: {},
    },
  };

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: ExportEffects;
  let gb3ExportService: Gb3ExportService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExportEffects, provideMockActions(() => actions$), provideMockStore()],
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
      const expectedFormat: ExportFormat = ExportFormat.GEOJSON;
      const gb3ExportServiceSpy = spyOn(gb3ExportService, 'exportDrawing').and.returnValue(of(new Blob()));

      store.overrideSelector(selectUserDrawingsVectorLayers, mockDrawings);
      actions$ = of(ExportActions.requestDrawingsExport({exportFormat: expectedFormat}));
      effects.requestExportDrawings$.subscribe((action) => {
        expect(gb3ExportServiceSpy).toHaveBeenCalledOnceWith(expectedFormat, mockDrawings.drawings);
        expect(action).toEqual(ExportActions.setDrawingsExportRequestResponse());
        done();
      });
    });

    it('dispatches ExportActions.setExportDrawingsRequestError() on error', (done: DoneFn) => {
      const expectedFormat: ExportFormat = ExportFormat.GEOJSON;
      const expectedError = new Error('oh no! butterfingers');
      const gb3ExportServiceSpy = spyOn(gb3ExportService, 'exportDrawing').and.returnValue(throwError(() => expectedError));

      store.overrideSelector(selectUserDrawingsVectorLayers, mockDrawings);
      actions$ = of(ExportActions.requestDrawingsExport({exportFormat: expectedFormat}));
      effects.requestExportDrawings$.subscribe((action) => {
        expect(gb3ExportServiceSpy).toHaveBeenCalledOnceWith(expectedFormat, mockDrawings.drawings);
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
          catchError((error) => {
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
