import {AfterViewInit, Component} from '@angular/core';
import {AbstractToolsComponent} from '../abstract-tools/abstract-tools.component';
import {DrawingSettingsDialogComponent} from '../drawing-settings-dialog/drawing-settings-dialog.component';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';
import {DrawingsImportDialogComponent} from '../drawings-import-dialog/drawings-import-dialog.component';

const DRAWING_SETTINGS_DIALOG_MAX_WIDTH = 420;

@Component({
  selector: 'drawing-tools',
  templateUrl: './drawing-tools.component.html',
  styleUrls: ['./drawing-tools.component.scss'],
})
export class DrawingToolsComponent extends AbstractToolsComponent implements AfterViewInit {
  public ngAfterViewInit() {
    this.openImportDrawingsDialog();
  }

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
      maxWidth: 750, // todo LME: set correct width
    });
  }
}
