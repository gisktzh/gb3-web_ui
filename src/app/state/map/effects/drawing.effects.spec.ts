import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {EMPTY, Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {DrawingEffects} from './drawing.effects';
import {DrawingActions} from '../actions/drawing.actions';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {createDrawingMapItemMock, createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {MapUiActions} from '../actions/map-ui.actions';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {ToolService} from '../../../map/interfaces/tool.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectSelectedDrawing} from '../reducers/drawing.reducer';
import {DrawingNotFound} from '../../../shared/errors/drawing.errors';
import {catchError} from 'rxjs';
import {MapService} from '../../../map/interfaces/map.service';
import {MAP_SERVICE} from '../../../app.tokens';

describe('DrawingEffects', () => {
  let actions$: Observable<Action>;
  let effects: DrawingEffects;
  let toolService: ToolService;
  let mapService: MapService;
  let store: MockStore;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DrawingEffects,
        provideMockActions(() => actions$),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    effects = TestBed.inject(DrawingEffects);
    mapService = TestBed.inject(MAP_SERVICE);
    toolService = mapService.getToolService();
    store = TestBed.inject(MockStore);
  });

  describe('clearAllDrawingLayers$', () => {
    it('dispatches DrawingActions.clearDrawings()', (done: DoneFn) => {
      actions$ = of(ActiveMapItemActions.removeAllActiveMapItems());

      effects.clearAllDrawingLayers$.subscribe((action) => {
        expect(action).toEqual(DrawingActions.clearDrawings());
        done();
      });
    });
  });

  describe('clearSingleDrawingLayer$', () => {
    it('dispatches nothing if the removed item is not a drawing item', fakeAsync(async () => {
      const mockActiveMapItem: ActiveMapItem = createGb2WmsMapItemMock('Attack of the Gurkenbröters');

      let actualAction;
      actions$ = of(ActiveMapItemActions.removeActiveMapItem({activeMapItem: mockActiveMapItem}));
      effects.clearSingleDrawingLayer$.subscribe((action) => (actualAction = action));
      tick();

      expect(actualAction).toBeUndefined();
    }));

    it('dispatches DrawingActions.clearDrawingLayer with the correct DrawingLayer', (done: DoneFn) => {
      const mockActiveMapItem: ActiveMapItem = createDrawingMapItemMock(UserDrawingLayer.Measurements);
      actions$ = of(ActiveMapItemActions.removeActiveMapItem({activeMapItem: mockActiveMapItem}));

      effects.clearSingleDrawingLayer$.subscribe((action) => {
        expect(action).toEqual(DrawingActions.clearDrawingLayer({layer: UserDrawingLayer.Measurements}));
        done();
      });
    });
  });
  describe('editDrawing$', () => {
    it('dispatches MapUiActions.setDrawingEditOverlayVisibility()', (done: DoneFn) => {
      store.overrideSelector(selectSelectedDrawing, {id: '123'} as Gb3StyledInternalDrawingRepresentation);
      actions$ = of(DrawingActions.selectDrawing({drawingId: '123'}));

      effects.editDrawing$.subscribe((action) => {
        expect(action).toEqual(MapUiActions.setDrawingEditOverlayVisibility({isVisible: true}));
        done();
      });
    });
    it('throws a DrawingNotFound Error if the selectedFeatrue is undefined', (done: DoneFn) => {
      store.overrideSelector(selectSelectedDrawing, undefined);
      actions$ = of(DrawingActions.selectDrawing({drawingId: '123'}));

      const expectedError = new DrawingNotFound();

      effects.editDrawing$
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

  describe('closeDrawingEditOverlayAfterFinishEditingOrDeleting$', () => {
    it('dispatches MapUiActions.setDrawingEditOverlayVisibility() after adding a Drawing', (done: DoneFn) => {
      actions$ = of(DrawingActions.addDrawing({drawing: {} as Gb3StyledInternalDrawingRepresentation}));

      effects.closeDrawingEditOverlayAfterFinishEditingOrDeleting$.subscribe((action) => {
        expect(action).toEqual(MapUiActions.setDrawingEditOverlayVisibility({isVisible: false}));
        done();
      });
    });

    it('dispatches MapUiActions.setDrawingEditOverlayVisibility() after adding a Measurement', (done: DoneFn) => {
      actions$ = of(DrawingActions.addDrawings({drawings: []}));

      effects.closeDrawingEditOverlayAfterFinishEditingOrDeleting$.subscribe((action) => {
        expect(action).toEqual(MapUiActions.setDrawingEditOverlayVisibility({isVisible: false}));
        done();
      });
    });

    it('dispatches MapUiActions.setDrawingEditOverlayVisibility() after deleting a drawing', (done: DoneFn) => {
      actions$ = of(DrawingActions.deleteDrawing({drawingId: '123'}));

      effects.closeDrawingEditOverlayAfterFinishEditingOrDeleting$.subscribe((action) => {
        expect(action).toEqual(MapUiActions.setDrawingEditOverlayVisibility({isVisible: false}));
        done();
      });
    });
  });

  describe('passStylingToToolService$', () => {
    it('calls toolService.updateDrawingStyles', (done: DoneFn) => {
      actions$ = of(
        DrawingActions.updateDrawingStyles({
          drawing: {} as Gb3StyledInternalDrawingRepresentation,
          style: {} as Gb3StyleRepresentation,
          labelText: '',
        }),
      );
      const toolServiceSpy = spyOn(toolService, 'updateDrawingStyles').and.callThrough();

      effects.passStylingToToolService$.subscribe(() => {
        expect(toolServiceSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('cancelEditModeAfterClosingDrawingEditOverlay', () => {
    it('calls toolService.cancelTool', (done: DoneFn) => {
      actions$ = of(DrawingActions.cancelEditMode());
      const mapServiceSpy = spyOn(mapService, 'cancelEditMode').and.callThrough();

      effects.cancelEditModeAfterClosingDrawingEditOverlay$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(MapUiActions.setDrawingEditOverlayVisibility({isVisible: false}));
        done();
      });
    });
  });
});
