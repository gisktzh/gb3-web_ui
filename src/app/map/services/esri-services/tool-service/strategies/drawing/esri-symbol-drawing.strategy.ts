import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import {MatDialog} from '@angular/material/dialog';
import {SupportedEsriTool} from '../supported-esri-tool.type';
import {DrawingMode} from '../../types/drawing-mode.type';
import {SymbolDrawingToolInputComponent} from 'src/app/map/components/symbols-drawing-tool-input/symbol-drawing-tool-input.component';
import {PanelClass} from 'src/app/shared/enums/panel-class.enum';
import {filter, tap} from 'rxjs';
import Graphic from '@arcgis/core/Graphic';
import {scaleCIMSymbolTo, applyCIMSymbolRotation} from '@arcgis/core/symbols/support/cimSymbolUtils.js';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import {Gb3SymbolStyle} from 'src/app/shared/interfaces/internal-drawing-representation.interface';
import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';
import {MapDrawingSymbol} from '../../../types/map-drawing-symbol.type';

export type SymbolDrawingInputComponentOutput = {
  webStyleSymbol: WebStyleSymbol;
  size: number;
  rotation: number;
};

export class EsriSymbolDrawingStrategy extends AbstractEsriDrawingStrategy<DrawingCallbackHandler['completeDrawing']> {
  protected readonly tool: SupportedEsriTool = 'point'; // Technically. ESRI doesn't know a "symbol" drawing strategy. We have to emulate that. A symbol is itself set with a point geometry, so it _does_ check out.
  private readonly dialogService: MatDialog;
  private mapDrawingSymbol: MapDrawingSymbol | undefined = undefined;
  private symbolSize: number = 10;
  private symbolRotation: number = 0;

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    completeDrawingCallbackHandler: DrawingCallbackHandler['completeDrawing'],
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
        filter((value): value is SymbolDrawingInputComponentOutput => !!value),
        tap(async ({webStyleSymbol, size, rotation}) => {
          const cimSymbol = (await webStyleSymbol.fetchSymbol({acceptedFormats: ['cim']})) as CIMSymbol;

          scaleCIMSymbolTo(cimSymbol, size);
          applyCIMSymbolRotation(cimSymbol, rotation);

          this.sketchViewModel.pointSymbol = cimSymbol;

          this.mapDrawingSymbol = {
            webStyleSymbol,
            cimSymbol,
          };
          this.symbolSize = size;
          this.symbolRotation = rotation;

          super.start();
        }),
      )
      .subscribe();
  }

  public override updateInternals(style: Gb3SymbolStyle, _: string, mapDrawingSymbol?: MapDrawingSymbol) {
    this.mapDrawingSymbol = mapDrawingSymbol;
    this.symbolSize = style.symbolSize;
    this.symbolRotation = style.symbolRotation;
  }

  protected override handleComplete(graphic: Graphic, mode: DrawingMode) {
    super.handleComplete(graphic, mode, undefined, this.mapDrawingSymbol, this.symbolSize, this.symbolRotation);
  }
}
