import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {DrawingEffects} from './drawing.effects';
import {DrawingActions} from '../actions/drawing.actions';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {createDrawingMapItemMock, createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {MapUiActions} from '../actions/map-ui.actions';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {ToolService} from '../../../map/interfaces/tool.service';

describe('DrawingEffects', () => {
  let actions$: Observable<Action>;
  let effects: DrawingEffects;
  let toolService: ToolService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DrawingEffects,
        provideMockActions(() => actions$),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    effects = TestBed.inject(DrawingEffects);
    const mapService = TestBed.inject(MAP_SERVICE);
    toolService = mapService.getToolService();
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
  describe('editDrawing', () => {
    it('dispatches MapUiActions.setDrawingEditOverlayVisibility()', (done: DoneFn) => {
      actions$ = of(DrawingActions.selectDrawing({drawingId: '123'}));

      effects.editDrawing$.subscribe((action) => {
        expect(action).toEqual(MapUiActions.setDrawingEditOverlayVisibility({isVisible: true}));
        done();
      });
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

  describe('cancelToolAfterClosingDrawingEditOverlay$', () => {
    it('calls toolService.cancelTool', (done: DoneFn) => {
      actions$ = of(MapUiActions.setDrawingEditOverlayVisibility({isVisible: false}));
      const toolServiceSpy = spyOn(toolService, 'cancelTool').and.callThrough();

      effects.cancelToolAfterClosingDrawingEditOverlay$.subscribe(() => {
        expect(toolServiceSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('dispatches nothing when FeatureINfo is closed', fakeAsync(async () => {
      const toolServiceSpy = spyOn(toolService, 'cancelTool').and.callThrough();
      let newAction;
      actions$ = of(MapUiActions.setDrawingEditOverlayVisibility({isVisible: false}));
      effects.cancelToolAfterClosingDrawingEditOverlay$.subscribe((action) => (newAction = action));
      flush();
      expect(toolServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();
    }));
  });
});
