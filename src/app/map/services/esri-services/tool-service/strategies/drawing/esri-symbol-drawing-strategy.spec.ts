import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import {UserDrawingLayer} from 'src/app/shared/enums/drawing-layer.enum';
import {EsriSymbolDrawingStrategy, SymbolDrawingInputComponentOutput} from './esri-symbol-drawing.strategy';
import Graphic from '@arcgis/core/Graphic';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {EsriMapDrawingSymbol} from '../../../types/esri-map-drawing-symbol.type';
import {of} from 'rxjs';
import {SymbolDrawingToolInputComponent} from 'src/app/map/components/symbols-drawing-tool-input/symbol-drawing-tool-input.component';
import {DrawingMode} from '../../types/drawing-mode.type';
import {EsriDrawingSymbolDefinition} from './drawing-symbol/esri-drawing-symbol-definition';
import {EsriDrawingSymbolDescriptor} from './drawing-symbol/esri-drawing-symbol-descriptor';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';

class EsriSymbolDrawingStrategyWrapper extends EsriSymbolDrawingStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
  public override handleComplete(graphic: Graphic, mode: DrawingMode) {
    super.handleComplete(graphic, mode);
  }

  public get symbolSizeInternal() {
    return this.symbolSize;
  }

  public get symbolRotationInternal() {
    return this.symbolRotation;
  }

  public get mapDrawingSymbolInternal() {
    return this.mapDrawingSymbol;
  }
}

describe('EsriSymbolDrawingStrategy', () => {
  let mapView: MapView;
  let layer: GraphicsLayer;
  const callbackHandler: {
    handle: DrawingCallbackHandler<'completeSymbolDrawing', EsriMapDrawingSymbol>;
  } = {
    handle(_1: Graphic | undefined, _2: DrawingMode, _3?: EsriMapDrawingSymbol, _4?: number, _5?: number) {
      return undefined;
    },
  };
  let dialog: MatDialog;
  const mockDrawingsSymbolService = {
    getCollection: vi.fn().mockName('DrawingSymbolsService.getCollection'),
    getCollectionInfos: vi.fn().mockName('DrawingSymbolsService.getCollectionInfos'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [provideMockStore({}), {provide: DRAWING_SYMBOLS_SERVICE, useValue: mockDrawingsSymbolService}],
    });
    dialog = TestBed.inject(MatDialog);

    mapView = new MapView({map: new Map()});
    layer = new GraphicsLayer({
      id: UserDrawingLayer.Measurements,
    });
    mapView.map!.layers.add(layer);
  });

  it('should not attempt to add anything when the initial dialog was closed without a value', async () => {
    vi.useFakeTimers();

    mockDrawingsSymbolService.getCollectionInfos.mockReturnValue({});
    const callbackSpy = vi.spyOn(callbackHandler, 'handle');
    const strategy = new EsriSymbolDrawingStrategyWrapper(layer, mapView, callbackHandler.handle, dialog);
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(null),
    } as MatDialogRef<typeof SymbolDrawingToolInputComponent, null>);

    strategy.start();

    await vi.runAllTimersAsync();

    expect(callbackSpy).toHaveBeenCalledWith(undefined, 'add');

    vi.useRealTimers();
  });

  it('should fetch a drawing symbol descriptor from a given drawing symbol definition and set it as the sketch views point symbol and its own internal values', async () => {
    vi.useFakeTimers();

    const mockSize = 10;
    const mockRotation = 11;
    const mockEsriDrawingSymbolDefinition = new EsriDrawingSymbolDefinition();
    const transformedDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 12,
        },
      },
    });
    const fetchSymbolSpy = vi
      .spyOn(mockEsriDrawingSymbolDefinition, 'fetchDrawingSymbolDescriptor')
      .mockResolvedValue(transformedDrawingSymbolDescriptor);

    mockDrawingsSymbolService.getCollectionInfos.mockReturnValue({});
    const callbackSpy = vi.spyOn(callbackHandler, 'handle');
    const strategy = new EsriSymbolDrawingStrategyWrapper(layer, mapView, callbackHandler.handle, dialog);
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () =>
        of({
          drawingSymbolDefinition: mockEsriDrawingSymbolDefinition,
          size: mockSize,
          rotation: mockRotation,
        }),
    } as MatDialogRef<typeof SymbolDrawingToolInputComponent, SymbolDrawingInputComponentOutput>);

    strategy.start();

    await vi.runAllTimersAsync();

    expect(strategy.symbolSizeInternal).toBe(mockSize);
    expect(strategy.symbolRotationInternal).toBe(mockRotation);
    expect(strategy.mapDrawingSymbolInternal).toEqual({
      drawingSymbolDefinition: mockEsriDrawingSymbolDefinition,
      drawingSymbolDescriptor: transformedDrawingSymbolDescriptor,
    });
    expect(strategy.svm.pointSymbol).toEqual(transformedDrawingSymbolDescriptor);
    expect(callbackSpy).not.toHaveBeenCalled();
    expect(fetchSymbolSpy).toHaveBeenCalledWith(mockSize, mockRotation);

    vi.useRealTimers();
  });

  it('should call the complete handler with the selected symbol once completed', async () => {
    vi.useFakeTimers();

    const mockSize = 10;
    const mockRotation = 11;
    const mockEsriDrawingSymbolDefinition = new EsriDrawingSymbolDefinition();
    const transformedDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 12,
        },
      },
    });

    mockDrawingsSymbolService.getCollectionInfos.mockReturnValue({});
    const callbackSpy = vi.spyOn(callbackHandler, 'handle');
    const strategy = new EsriSymbolDrawingStrategyWrapper(layer, mapView, callbackHandler.handle, dialog);
    vi.spyOn(mockEsriDrawingSymbolDefinition, 'fetchDrawingSymbolDescriptor').mockResolvedValue(transformedDrawingSymbolDescriptor);
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () =>
        of({
          drawingSymbolDefinition: mockEsriDrawingSymbolDefinition,
          size: mockSize,
          rotation: mockRotation,
        }),
    } as MatDialogRef<typeof SymbolDrawingToolInputComponent, SymbolDrawingInputComponentOutput>);

    strategy.start();

    await vi.runAllTimersAsync();

    const graphic = new Graphic();

    strategy.handleComplete(graphic, 'add');

    expect(callbackSpy).toHaveBeenCalledWith(
      graphic,
      'add',
      {
        drawingSymbolDefinition: mockEsriDrawingSymbolDefinition,
        drawingSymbolDescriptor: transformedDrawingSymbolDescriptor,
      },
      mockSize,
      mockRotation,
    );

    vi.useRealTimers();
  });

  it('should update its internals correctly when set from outside', async () => {
    vi.useFakeTimers();

    const mockInitialSize = 10;
    const mockInitialRotation = 11;
    const mockInitialEsriDrawingSymbolDefinition = new EsriDrawingSymbolDefinition();
    const initialTransformedDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 12,
        },
      },
    });

    const mockUpdatedSize = 12;
    const mockUpdatedRotation = 13;
    const mockUpdatedEsriDrawingSymbolDefinition = new EsriDrawingSymbolDefinition();
    const updatedTransformedDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 14,
        },
      },
    });

    mockDrawingsSymbolService.getCollectionInfos.mockReturnValue({});
    const callbackSpy = vi.spyOn(callbackHandler, 'handle');
    const strategy = new EsriSymbolDrawingStrategyWrapper(layer, mapView, callbackHandler.handle, dialog);
    vi.spyOn(mockInitialEsriDrawingSymbolDefinition, 'fetchDrawingSymbolDescriptor').mockResolvedValue(
      initialTransformedDrawingSymbolDescriptor,
    );
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () =>
        of({
          drawingSymbolDefinition: mockInitialEsriDrawingSymbolDefinition,
          size: mockInitialSize,
          rotation: mockInitialRotation,
        }),
    } as MatDialogRef<typeof SymbolDrawingToolInputComponent, SymbolDrawingInputComponentOutput>);

    strategy.start();

    await vi.runAllTimersAsync();

    strategy.updateInternals(
      {
        type: 'symbol',
        symbolSize: mockUpdatedSize,
        symbolRotation: mockUpdatedRotation,
        symbolDefinition: null,
      },
      {
        drawingSymbolDefinition: mockUpdatedEsriDrawingSymbolDefinition,
        drawingSymbolDescriptor: updatedTransformedDrawingSymbolDescriptor,
      },
    );

    const graphic = new Graphic();

    strategy.handleComplete(graphic, 'add');

    expect(callbackSpy).toHaveBeenCalledWith(
      graphic,
      'add',
      {
        drawingSymbolDefinition: mockUpdatedEsriDrawingSymbolDefinition,
        drawingSymbolDescriptor: updatedTransformedDrawingSymbolDescriptor,
      },
      mockUpdatedSize,
      mockUpdatedRotation,
    );

    vi.useRealTimers();
  });
});
