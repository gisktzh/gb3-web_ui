import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {DrawingCallbackHandler, DrawingCallbackHandlerArgsTextDrawing} from '../../interfaces/drawing-callback-handler.interface';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {MatDialog} from '@angular/material/dialog';
import {PanelClass} from '../../../../../../shared/enums/panel-class.enum';
import {tap} from 'rxjs';
import {TextDrawingToolInputComponent} from '../../../../../components/text-drawing-tool-input/text-drawing-tool-input.component';
import {SupportedEsriTool} from '../supported-esri-tool.type';
import {DrawingMode} from '../../types/drawing-mode.type';
import Graphic from '@arcgis/core/Graphic';

export class EsriTextDrawingStrategy extends AbstractEsriDrawingStrategy<DrawingCallbackHandlerArgsTextDrawing> {
  protected readonly tool: SupportedEsriTool = 'point';
  private readonly dialogService: MatDialog;
  private labelText: string | undefined;

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    textSymbol: __esri.TextSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler<DrawingCallbackHandlerArgsTextDrawing>,
    dialogService: MatDialog,
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.pointSymbol = textSymbol;
    this.dialogService = dialogService;
  }

  protected override handleComplete(graphic: Graphic, mode: DrawingMode) {
    if (mode === 'add') {
      const dialog = this.dialogService.open<TextDrawingToolInputComponent, void, string>(TextDrawingToolInputComponent, {
        panelClass: PanelClass.ApiWrapperDialog,
        restoreFocus: false,
        disableClose: true,
      });
      return dialog
        .afterClosed()
        .pipe(
          tap((text = '') => {
            if (!text) {
              this.layer.remove(graphic);
            }
            this.labelText = text;
            (graphic.symbol as TextSymbol).text = text;
            super.handleComplete(graphic, mode, text);
          }),
        )
        .subscribe();
    }

    if (mode === 'edit') {
      return super.handleComplete(graphic, mode, this.labelText);
    }
  }

  public override updateInternals(_: unknown, labelText: string): void {
    this.labelText = labelText;
  }
}
