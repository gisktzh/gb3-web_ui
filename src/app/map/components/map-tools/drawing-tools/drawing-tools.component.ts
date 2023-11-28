import {Component} from '@angular/core';
import {AbstractToolsComponent} from '../abstract-tools/abstract-tools.component';
import {DrawingSettingsComponent} from '../drawing-settings/drawing-settings.component';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';

@Component({
  selector: 'drawing-tools',
  templateUrl: './drawing-tools.component.html',
  styleUrls: ['./drawing-tools.component.scss'],
})
export class DrawingToolsComponent extends AbstractToolsComponent {
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
    this.dialogService.open(DrawingSettingsComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
    });
  }
}
