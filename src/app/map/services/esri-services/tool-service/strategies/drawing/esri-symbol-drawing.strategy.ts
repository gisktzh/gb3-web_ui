import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {
  DrawingCallbackHandler,
  DrawingCallbackHandlerArgsSymbolDrawing,
  DrawingInternalUpdateArgs,
} from '../../interfaces/drawing-callback-handler.interface';
import {MatDialog} from '@angular/material/dialog';
import {SupportedEsriTool} from '../supported-esri-tool.type';
import {DrawingMode} from '../../types/drawing-mode.type';
import {SymbolDrawingToolInputComponent} from 'src/app/map/components/symbols-drawing-tool-input/symbol-drawing-tool-input.component';
import {PanelClass} from 'src/app/shared/enums/panel-class.enum';
import {tap} from 'rxjs';
import Graphic from '@arcgis/core/Graphic';
import {Gb3SymbolStyle} from 'src/app/shared/interfaces/internal-drawing-representation.interface';
import {EsriMapDrawingSymbol} from '../../../types/esri-map-drawing-symbol.type';
import {SymbolStyleConstants} from 'src/app/shared/constants/symbol-style.constants';
import {EsriDrawingSymbolDefinition} from './drawing-symbol/esri-drawing-symbol-definition';

export type SymbolDrawingInputComponentOutput = {
  drawingSymbolDefinition: EsriDrawingSymbolDefinition;
  size: number;
  rotation: number;
};

export class EsriSymbolDrawingStrategy extends AbstractEsriDrawingStrategy<
  DrawingCallbackHandlerArgsSymbolDrawing,
  DrawingInternalUpdateArgs<EsriMapDrawingSymbol>[DrawingCallbackHandlerArgsSymbolDrawing],
  EsriMapDrawingSymbol
> {
  protected readonly tool: SupportedEsriTool = 'point';
  private readonly dialogService: MatDialog;
  private mapDrawingSymbol: EsriMapDrawingSymbol | undefined = undefined;
  private symbolSize: number = SymbolStyleConstants.DEFAULT_SYMBOL_SIZE;
  private symbolRotation: number = SymbolStyleConstants.DEFAULT_SYMBOL_ROTATION;

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    completeDrawingCallbackHandler: DrawingCallbackHandler<DrawingCallbackHandlerArgsSymbolDrawing, EsriMapDrawingSymbol>,
    dialogService: MatDialog,
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);
    this.dialogService = dialogService;
  }

  public override start() {
    const dialog = this.dialogService.open<SymbolDrawingToolInputComponent, void, SymbolDrawingInputComponentOutput>(
      SymbolDrawingToolInputComponent,
      {
        panelClass: [PanelClass.ApiWrapperDialog, PanelClass.ApiWrapperDialogFlex],
        restoreFocus: false,
        disableClose: true,
      },
    );

    dialog
      .afterClosed()
      .pipe(
        tap(async (value) => {
          if (!value) {
            super.handleComplete(undefined, 'add');
            return;
          }

          const {drawingSymbolDefinition, size, rotation} = value;

          const drawingSymbolDescriptor = await drawingSymbolDefinition.fetchDrawingSymbolDescriptor(size, rotation);

          this.sketchViewModel.pointSymbol = drawingSymbolDescriptor;

          this.mapDrawingSymbol = {
            drawingSymbolDefinition,
            drawingSymbolDescriptor,
          };
          this.symbolSize = size;
          this.symbolRotation = rotation;

          super.start();
        }),
      )
      .subscribe();
  }

  public override updateInternals(style: Gb3SymbolStyle, mapDrawingSymbol?: EsriMapDrawingSymbol) {
    this.mapDrawingSymbol = mapDrawingSymbol;
    this.symbolSize = style.symbolSize;
    this.symbolRotation = style.symbolRotation;
  }

  protected override handleComplete(graphic: Graphic, mode: DrawingMode) {
    super.handleComplete(graphic, mode, this.mapDrawingSymbol, this.symbolSize, this.symbolRotation);
  }
}
