import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3PolygonStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {StrokeStyle} from '../stroke-edit/stroke-edit.component';
import {FillStyle} from '../fill-edit/fill-edit.component';

@Component({
  selector: 'polygon-edit',
  templateUrl: './polygon-edit.component.html',
  styleUrl: './polygon-edit.component.scss',
})
export class PolygonEditComponent {
  @Input() public polygonStyle!: Gb3PolygonStyle;

  @Output() public updateStyle = new EventEmitter<Gb3PolygonStyle>();
  public updateStrokeAttributes(strokeStyle: StrokeStyle) {
    this.polygonStyle = {
      ...this.polygonStyle,
      strokeWidth: strokeStyle.strokeWidth,
      strokeColor: strokeStyle.strokeColor,
      strokeOpacity: strokeStyle.strokeOpacity,
    };
    this.updateStyle.emit(this.polygonStyle);
  }

  public updateFillAttributes(fillStyle: FillStyle) {
    this.polygonStyle = {
      ...this.polygonStyle,
      fillOpacity: fillStyle.fillOpacity,
      fillColor: fillStyle.fillColor,
    };
    this.updateStyle.emit(this.polygonStyle);
  }
}
