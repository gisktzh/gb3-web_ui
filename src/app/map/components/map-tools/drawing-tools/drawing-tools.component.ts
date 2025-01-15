import {Component} from '@angular/core';
import {AbstractToolsComponent} from '../abstract-tools/abstract-tools.component';
import {DrawingSettingsDialogComponent} from '../drawing-settings-dialog/drawing-settings-dialog.component';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';
import {DrawingsImportDialogComponent} from '../drawings-import-dialog/drawings-import-dialog.component';

const DRAWING_SETTINGS_DIALOG_MAX_WIDTH = 420;
const DRAWING_UPLOAD_DIALOG_MAX_WIDTH = 750;
const TOOLTIP_TEXT = {
  settings: 'Einstellungen',
  pointDrawing: 'Punkt: In Karte klicken um zu wählen.',
  lineDrawing: 'Linie: Mit Doppelklick beenden.',
  polygonDrawing: 'Polygon: Auf Startpunkt klicken oder Doppelklick um zu beenden.',
  rectangleDrawing: 'Rechteck: Diagonale Eckpunkte wählen.',
  circleDrawing: 'Kreis: Mittelpunkt und Radius wählen.',
  textDrawing: 'Text: In Karte klicken um Position zu wählen, anschliessend Text eingeben.',
  uploadDrawings: 'Zeichnungen hochladen',
};
@Component({
  selector: 'drawing-tools',
  templateUrl: './drawing-tools.component.html',
  styleUrls: ['./drawing-tools.component.scss'],
  standalone: false,
})
export class DrawingToolsComponent extends AbstractToolsComponent {
  public tooltipText = TOOLTIP_TEXT;
  public togglePointDrawing() {
    this.toggleTool('draw-point');
  }

  public toggleLineDrawing() {
    this.toggleTool('draw-line');
  }

  public togglePolygonDrawing() {
    this.toggleTool('draw-polygon');
  }

  public toggleRectangleDrawing() {
    this.toggleTool('draw-rectangle');
  }

  public toggleCircleDrawing() {
    this.toggleTool('draw-circle');
  }

  public toggleTextDrawing() {
    this.toggleTool('draw-text');
  }

  public openSettingsDialog() {
    this.dialogService.open(DrawingSettingsDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      autoFocus: false,
      maxWidth: DRAWING_SETTINGS_DIALOG_MAX_WIDTH,
    });
  }

  public openImportDrawingsDialog() {
    this.dialogService.open(DrawingsImportDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      autoFocus: false,
      maxWidth: DRAWING_UPLOAD_DIALOG_MAX_WIDTH,
    });
  }
}
