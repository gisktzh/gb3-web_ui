import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import {UserDrawingLayer} from 'src/app/shared/enums/drawing-layer.enum';
import {EsriSymbolDrawingStrategy, SymbolDrawingInputComponentOutput} from './esri-symbol-drawing.strategy';
import Graphic from '@arcgis/core/Graphic';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {EsriMapDrawingSymbol} from '../../../types/esri-map-drawing-symbol.type';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
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
  const callbackHandler: {handle: DrawingCallbackHandler<'completeSymbolDrawing', EsriMapDrawingSymbol>} = {
    handle(_1: Graphic | undefined, _2: DrawingMode, _3?: EsriMapDrawingSymbol, _4?: number, _5?: number) {
      return undefined;
    },
  };
  let dialog: MatDialog;
  const mockDrawingsSymbolService = jasmine.createSpyObj<DrawingSymbolsService>('DrawingSymbolsService', [
    'getCollection',
    'getCollectionInfos',
  ]);

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

  it('should not attempt to add anything when the initial dialog was closed without a value', fakeAsync(() => {
    mockDrawingsSymbolService.getCollectionInfos.and.returnValue({});
    const callbackSpy = spyOn(callbackHandler, 'handle');
    const strategy = new EsriSymbolDrawingStrategyWrapper(layer, mapView, callbackHandler.handle, dialog);
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of(null),
    } as MatDialogRef<typeof SymbolDrawingToolInputComponent, null>);

    strategy.start();

    flushMicrotasks();

    expect(callbackSpy).toHaveBeenCalledWith(undefined, 'add');
  }));

  it('should fetch a drawing symbol descriptor from a given drawing symbol definition and set it as the sketch views point symbol and its own internal values', fakeAsync(() => {
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
    const fetchSymbolSpy = spyOn(mockEsriDrawingSymbolDefinition, 'fetchDrawingSymbolDescriptor').and.resolveTo(
      transformedDrawingSymbolDescriptor,
    );

    mockDrawingsSymbolService.getCollectionInfos.and.returnValue({});
    const callbackSpy = spyOn(callbackHandler, 'handle');
    const strategy = new EsriSymbolDrawingStrategyWrapper(layer, mapView, callbackHandler.handle, dialog);
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () =>
        of({
          drawingSymbolDefinition: mockEsriDrawingSymbolDefinition,
          size: mockSize,
          rotation: mockRotation,
        }),
    } as MatDialogRef<typeof SymbolDrawingToolInputComponent, SymbolDrawingInputComponentOutput>);

    strategy.start();

    flushMicrotasks();

    expect(strategy.symbolSizeInternal).toBe(mockSize);
    expect(strategy.symbolRotationInternal).toBe(mockRotation);
    expect(strategy.mapDrawingSymbolInternal).toEqual({
      drawingSymbolDefinition: mockEsriDrawingSymbolDefinition,
      drawingSymbolDescriptor: transformedDrawingSymbolDescriptor,
    });
    expect(strategy.svm.pointSymbol).toEqual(transformedDrawingSymbolDescriptor);
    expect(callbackSpy).not.toHaveBeenCalled();
    expect(fetchSymbolSpy).toHaveBeenCalledWith(mockSize, mockRotation);
  }));

  it('should call the complete handler with the selected symbol once completed', fakeAsync(() => {
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

    mockDrawingsSymbolService.getCollectionInfos.and.returnValue({});
    const callbackSpy = spyOn(callbackHandler, 'handle');
    const strategy = new EsriSymbolDrawingStrategyWrapper(layer, mapView, callbackHandler.handle, dialog);
    spyOn(mockEsriDrawingSymbolDefinition, 'fetchDrawingSymbolDescriptor').and.resolveTo(transformedDrawingSymbolDescriptor);
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () =>
        of({
          drawingSymbolDefinition: mockEsriDrawingSymbolDefinition,
          size: mockSize,
          rotation: mockRotation,
        }),
    } as MatDialogRef<typeof SymbolDrawingToolInputComponent, SymbolDrawingInputComponentOutput>);

    strategy.start();

    flushMicrotasks();

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
  }));

  it('should update its internals correctly when set from outside', fakeAsync(() => {
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

    mockDrawingsSymbolService.getCollectionInfos.and.returnValue({});
    const callbackSpy = spyOn(callbackHandler, 'handle');
    const strategy = new EsriSymbolDrawingStrategyWrapper(layer, mapView, callbackHandler.handle, dialog);
    spyOn(mockInitialEsriDrawingSymbolDefinition, 'fetchDrawingSymbolDescriptor').and.resolveTo(initialTransformedDrawingSymbolDescriptor);
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () =>
        of({
          drawingSymbolDefinition: mockInitialEsriDrawingSymbolDefinition,
          size: mockInitialSize,
          rotation: mockInitialRotation,
        }),
    } as MatDialogRef<typeof SymbolDrawingToolInputComponent, SymbolDrawingInputComponentOutput>);

    strategy.start();

    flushMicrotasks();

    strategy.updateInternals(
      {
        type: 'symbol',
        symbolSize: mockUpdatedSize,
        symbolRotation: mockUpdatedRotation,
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
  }));
});
