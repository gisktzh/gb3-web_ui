import {Gb3ImportService} from '../../../shared/services/apis/gb3/gb3-import.service';
import {ImportEffects} from './import.effects';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Gb3VectorLayer} from '../../../shared/interfaces/gb3-vector-layer.interface';
import {ImportActions} from '../actions/import.actions';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {catchError} from 'rxjs/operators';
import {FileImportError} from '../../../shared/errors/file-upload.errors';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {MapConstants} from '../../../shared/constants/map.constants';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {DrawingActions} from '../actions/drawing.actions';
import {Gb3StyledInternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {SymbolizationToGb3ConverterUtils} from '../../../shared/utils/symbolization-to-gb3-converter.utils';

describe('ImportEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: ImportEffects;
  let gb3ImportService: Gb3ImportService;
  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImportEffects, provideMockActions(() => actions$), provideMockStore(), {provide: MAP_SERVICE, useClass: MapServiceStub}],
    });
    effects = TestBed.inject(ImportEffects);
    store = TestBed.inject(MockStore);
    gb3ImportService = TestBed.inject(Gb3ImportService);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('requestImportDrawings$', () => {
    it('calls ImportService.importDrawing and dispatches ImportActions.createActiveMapItemFromDrawing', (done: DoneFn) => {
      const expectedDrawing: Gb3VectorLayer = {
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
      };
      const file: File = new File([], 'test');
      const gb3ImportServiceSpy = spyOn(gb3ImportService, 'importDrawing').and.returnValue(of(expectedDrawing));

      actions$ = of(ImportActions.requestDrawingsImport({file}));
      effects.requestImportDrawings$.subscribe((action) => {
        expect(gb3ImportServiceSpy).toHaveBeenCalledOnceWith(file);
        expect(action).toEqual(ImportActions.createActiveMapItemFromDrawing({drawing: expectedDrawing}));
        done();
      });
    });
    it('disaptches ImportService.setDrawingsImportRequestError on error', (done: DoneFn) => {
      const expectedError = new Error('oh no! butterfingers');
      const file: File = new File([], 'test');
      const gb3ImportServiceSpy = spyOn(gb3ImportService, 'importDrawing').and.returnValue(throwError(() => expectedError));

      actions$ = of(ImportActions.requestDrawingsImport({file: new File([], 'test')}));
      effects.requestImportDrawings$.subscribe((action) => {
        expect(gb3ImportServiceSpy).toHaveBeenCalledOnceWith(file);
        expect(action).toEqual(ImportActions.setDrawingsImportRequestError({error: expectedError}));
        done();
      });
    });
  });
  describe('addDrawingToMap$', () => {
    it('dispatches ImportActions.addDrawingToMap', (done: DoneFn) => {
      const mockDrawing: Gb3VectorLayer = {
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
      };
      const activeMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, MapConstants.USER_DRAWING_LAYER_PREFIX);
      const drawingLayersToOverride = [UserDrawingLayer.Drawings];
      const drawingsToAdd = SymbolizationToGb3ConverterUtils.convertExternalToInternalRepresentation(
        mockDrawing,
        UserDrawingLayer.Drawings,
      );
      const converterSpy = spyOn(SymbolizationToGb3ConverterUtils, 'convertExternalToInternalRepresentation').and.returnValue(
        drawingsToAdd,
      );
      const mapServiceSpy = spyOn(TestBed.inject(MAP_SERVICE), 'removeMapItem');
      const toolServiceSpy = spyOn(TestBed.inject(MAP_SERVICE).getToolService(), 'addExistingDrawingsToLayer');
      actions$ = of(ImportActions.createActiveMapItemFromDrawing({drawing: mockDrawing}));
      effects.addDrawingToMap$.subscribe((action) => {
        expect(converterSpy).toHaveBeenCalledOnceWith(mockDrawing, UserDrawingLayer.Drawings);
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(activeMapItem.id);
        expect(toolServiceSpy).toHaveBeenCalledOnceWith(drawingsToAdd, UserDrawingLayer.Drawings);
        expect(action).toEqual(ImportActions.addDrawingToMap({activeMapItem, drawingLayersToOverride, drawingsToAdd}));
        done();
      });
    });
  });

  describe('addDrawingToActiveMapItmes$', () => {
    it('dispatches ActiveMapItemActions.addActiveMapItem', (done: DoneFn) => {
      const activeMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, MapConstants.USER_DRAWING_LAYER_PREFIX);
      actions$ = of(
        ImportActions.addDrawingToMap({activeMapItem, drawingLayersToOverride: [UserDrawingLayer.Drawings], drawingsToAdd: []}),
      );
      effects.addDrawingToActiveMapItmes$.subscribe((action) => {
        expect(action).toEqual(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
        done();
      });
    });
  });
  describe('overrideExistingDrawings$', () => {
    it('dispatches DrawingActions.overwriteDrawingLayersWithDrawings', (done: DoneFn) => {
      const activeMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, MapConstants.USER_DRAWING_LAYER_PREFIX);
      const layersToOverride = [UserDrawingLayer.Drawings];
      const drawingsToAdd: Gb3StyledInternalDrawingRepresentation[] = [];
      actions$ = of(ImportActions.addDrawingToMap({activeMapItem, drawingLayersToOverride: layersToOverride, drawingsToAdd}));
      effects.overrideExistingDrawings$.subscribe((action) => {
        expect(action).toEqual(DrawingActions.overwriteDrawingLayersWithDrawings({layersToOverride, drawingsToAdd}));
        done();
      });
    });
  });
  describe('resetLoadingStateAfterSuccessfullyAddingDrawingToMap$', () => {
    it('dispatches ImportActions.resetLoadingStateAfterSuccessfullyAddingDrawingToMap$', (done: DoneFn) => {
      const activeMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, MapConstants.USER_DRAWING_LAYER_PREFIX);
      const layersToOverride = [UserDrawingLayer.Drawings];
      const drawingsToAdd: Gb3StyledInternalDrawingRepresentation[] = [];
      actions$ = of(ImportActions.addDrawingToMap({activeMapItem, drawingLayersToOverride: layersToOverride, drawingsToAdd}));
      effects.resetLoadingStateAfterSuccessfullyAddingDrawingToMap$.subscribe((action) => {
        expect(action).toEqual(ImportActions.resetDrawingImportState());
        done();
      });
    });
  });
  describe('throwImportDrawingsRequestError$', () => {
    it('throws a DrawingCouldNotBeExported error', (done: DoneFn) => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(ImportActions.setDrawingsImportRequestError({error: expectedOriginalError}));
      effects.throwImportDrawingsRequestError$
        .pipe(
          catchError((error) => {
            const expectedError = new FileImportError(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
