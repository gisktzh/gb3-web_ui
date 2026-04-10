import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ToolEffects} from './tool.effects';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {ToolActions} from '../actions/tool.actions';
import {ToolService} from '../../../map/interfaces/tool.service';
import {MeasurementTool} from '../../../shared/types/measurement-tool.type';
import {DrawingTool} from '../../../shared/types/drawing-tool.type';
import {DataDownloadSelectionTool} from '../../../shared/types/data-download-selection-tool.type';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {MAP_SERVICE} from '../../../app.tokens';

describe('ToolEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: ToolEffects;
  let toolService: ToolService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ToolEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
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
    it('initializes the measurement tool using the tool service; dispatches no further actions', async () => {
      vi.useFakeTimers();

      const expectedTools: Exclude<MeasurementTool, 'measure-elevation-profile'>[] = ['measure-area', 'measure-point', 'measure-line'];
      const toolServiceSpy = vi.spyOn(toolService, 'initializeMeasurement');
      await Promise.all(
        expectedTools.map(async (expectedTool) => {
          toolServiceSpy.mockClear();
          const expectedAction = ToolActions.activateTool({tool: expectedTool});
          actions$ = of(expectedAction);
          effects.initializeTool$.subscribe((action) => {
            expect(toolServiceSpy).toHaveBeenCalledTimes(1);
            expect(toolServiceSpy).toHaveBeenCalledWith(expectedTool);
            expect(action).toEqual(expectedAction);
          });
          await vi.runAllTimersAsync();
        }),
      );
      vi.useRealTimers();
    });

    it('initializes the elevation profile measurement tool using the tool service; dispatches no further actions', async () => {
      vi.useFakeTimers();

      const tool: MeasurementTool = 'measure-elevation-profile';
      const toolServiceSpy = vi.spyOn(toolService, 'initializeElevationProfileMeasurement');
      toolServiceSpy.mockClear();
      const expectedAction = ToolActions.activateTool({tool: tool});
      actions$ = of(expectedAction);
      effects.initializeTool$.subscribe((action) => {
        expect(toolServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(expectedAction);
      });
      await vi.runAllTimersAsync();
      vi.useRealTimers();
    });

    it('initializes the drawing tool using the tool service; dispatches no further actions', async () => {
      vi.useFakeTimers();

      const expectedTools: DrawingTool[] = ['draw-circle', 'draw-polygon', 'draw-line', 'draw-point', 'draw-rectangle'];
      const toolServiceSpy = vi.spyOn(toolService, 'initializeDrawing');
      await Promise.all(
        expectedTools.map(async (expectedTool) => {
          toolServiceSpy.mockClear();
          const expectedAction = ToolActions.activateTool({tool: expectedTool});
          actions$ = of(expectedAction);
          effects.initializeTool$.subscribe((action) => {
            expect(toolServiceSpy).toHaveBeenCalledTimes(1);
            expect(toolServiceSpy).toHaveBeenCalledWith(expectedTool);
            expect(action).toEqual(expectedAction);
          });
          await vi.runAllTimersAsync();
        }),
      );

      vi.useRealTimers();
    });

    it('initializes the selection tool using the tool service; dispatches no further actions', async () => {
      vi.useFakeTimers();

      const expectedTools: DataDownloadSelectionTool[] = [
        'select-polygon',
        'select-circle',
        'select-rectangle',
        'select-municipality',
        'select-canton',
        'select-section',
      ];
      const toolServiceSpy = vi.spyOn(toolService, 'initializeDataDownloadSelection');
      await Promise.all(
        expectedTools.map(async (expectedTool) => {
          toolServiceSpy.mockClear();
          const expectedAction = ToolActions.activateTool({tool: expectedTool});
          actions$ = of(expectedAction);
          effects.initializeTool$.subscribe((action) => {
            expect(toolServiceSpy).toHaveBeenCalledTimes(1);
            expect(toolServiceSpy).toHaveBeenCalledWith(expectedTool);
            expect(action).toEqual(expectedAction);
          });
          await vi.runAllTimersAsync();
        }),
      );

      vi.useRealTimers();
    });
  });

  describe('cancelOrDeactivateTool$', () => {
    it('cancels the tool service after deactivating the active tool; dispatches no further actions', () => {
      const toolServiceSpy = vi.spyOn(toolService, 'cancelTool');
      const expectedAction = ToolActions.deactivateTool();
      actions$ = of(expectedAction);
      effects.cancelOrDeactivateTool$.subscribe((action) => {
        expect(toolServiceSpy).toHaveBeenCalledTimes(1);
        expect(toolServiceSpy).toHaveBeenCalledWith();
        expect(action).toEqual(expectedAction);
      });
    });

    it('cancels the tool service after cancelling the active tool; dispatches no further actions', () => {
      const toolServiceSpy = vi.spyOn(toolService, 'cancelTool');
      const expectedAction = ToolActions.cancelTool();
      actions$ = of(expectedAction);
      effects.cancelOrDeactivateTool$.subscribe((action) => {
        expect(toolServiceSpy).toHaveBeenCalledTimes(1);
        expect(toolServiceSpy).toHaveBeenCalledWith();
        expect(action).toEqual(expectedAction);
      });
    });
  });
});
