import {Component} from '@angular/core';
import {AbstractToolsComponent} from '../abstract-tools/abstract-tools.component';

@Component({
  selector: 'drawing-tools',
  templateUrl: './drawing-tools.component.html',
  styleUrls: ['./drawing-tools.component.scss']
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
}
