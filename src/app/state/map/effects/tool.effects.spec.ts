import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ToolEffects} from './tool.effects';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {ToolActions} from '../actions/tool.actions';
import {ToolService} from '../../../map/interfaces/tool.service';
import {MeasurementTool} from '../../../shared/types/measurement-tool.type';
import {DrawingTool} from '../../../shared/types/drawing-tool.type';
import {DataDownloadSelectionTool} from '../../../shared/types/data-download-selection-tool.type';

describe('ToolEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: ToolEffects;
  let toolService: ToolService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [ToolEffects, provideMockActions(() => actions$), provideMockStore(), {provide: MAP_SERVICE, useClass: MapServiceStub}],
    });
    effects = TestBed.inject(ToolEffects);
    const mapService = TestBed.inject(MAP_SERVICE);
    toolService = mapService.getToolService();

    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('initializeTool$', () => {
    it('initializes the measurement tool using the tool service; dispatches no further actions', fakeAsync(() => {
      const expectedTools: MeasurementTool[] = ['measure-area', 'measure-point', 'measure-line'];
      const toolServiceSpy = spyOn(toolService, 'initializeMeasurement').and.callThrough();
      expectedTools.forEach((expectedTool) => {
        toolServiceSpy.calls.reset();
        const expectedAction = ToolActions.activateTool({tool: expectedTool});
        actions$ = of(expectedAction);
        effects.initializeTool$.subscribe((action) => {
          expect(toolServiceSpy).toHaveBeenCalledOnceWith(expectedTool);
          expect(action).toEqual(expectedAction);
        });
        flush();
      });
    }));

    it('initializes the drawing tool using the tool service; dispatches no further actions', fakeAsync(() => {
      const expectedTools: DrawingTool[] = ['draw-circle', 'draw-polygon', 'draw-line', 'draw-point', 'draw-rectangle'];
      const toolServiceSpy = spyOn(toolService, 'initializeDrawing').and.callThrough();
      expectedTools.forEach((expectedTool) => {
        toolServiceSpy.calls.reset();
        const expectedAction = ToolActions.activateTool({tool: expectedTool});
        actions$ = of(expectedAction);
        effects.initializeTool$.subscribe((action) => {
          expect(toolServiceSpy).toHaveBeenCalledOnceWith(expectedTool);
          expect(action).toEqual(expectedAction);
        });
        flush();
      });
    }));

    it('initializes the selection tool using the tool service; dispatches no further actions', fakeAsync(() => {
      const expectedTools: DataDownloadSelectionTool[] = [
        'select-polygon',
        'select-circle',
        'select-rectangle',
        'select-municipality',
        'select-canton',
        'select-section',
      ];
      const toolServiceSpy = spyOn(toolService, 'initializeDataDownloadSelection').and.callThrough();
      expectedTools.forEach((expectedTool) => {
        toolServiceSpy.calls.reset();
        const expectedAction = ToolActions.activateTool({tool: expectedTool});
        actions$ = of(expectedAction);
        effects.initializeTool$.subscribe((action) => {
          expect(toolServiceSpy).toHaveBeenCalledOnceWith(expectedTool);
          expect(action).toEqual(expectedAction);
        });
        flush();
      });
    }));
  });

  describe('cancelOrDeactivateTool$', () => {
    it('cancels the tool service after deactivating the active tool; dispatches no further actions', (done: DoneFn) => {
      const toolServiceSpy = spyOn(toolService, 'cancelTool').and.callThrough();
      const expectedAction = ToolActions.deactivateTool();
      actions$ = of(expectedAction);
      effects.cancelOrDeactivateTool$.subscribe((action) => {
        expect(toolServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('cancels the tool service after cancelling the active tool; dispatches no further actions', (done: DoneFn) => {
      const toolServiceSpy = spyOn(toolService, 'cancelTool').and.callThrough();
      const expectedAction = ToolActions.cancelTool();
      actions$ = of(expectedAction);
      effects.cancelOrDeactivateTool$.subscribe((action) => {
        expect(toolServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });
});
