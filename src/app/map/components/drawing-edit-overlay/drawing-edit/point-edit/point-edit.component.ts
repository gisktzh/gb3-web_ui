import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Gb3PointStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {StrokeStyle} from '../stroke-edit/stroke-edit.component';
import {FillStyle} from '../fill-edit/fill-edit.component';

@Component({
  selector: 'point-edit',
  templateUrl: './point-edit.component.html',
  styleUrl: './point-edit.component.scss',
})
export class PointEditComponent implements OnInit {
  @Input() public pointStyle!: Gb3PointStyle;
  public pointRadius: number = 0;

  @Output() public updateStyle = new EventEmitter<Gb3PointStyle>();

  public ngOnInit() {
    this.pointRadius = this.pointStyle.pointRadius;
  }

  public updateStrokeAttributes(strokeStyle: StrokeStyle) {
    this.pointStyle = {
      ...this.pointStyle,
      strokeWidth: strokeStyle.strokeWidth,
      strokeColor: strokeStyle.strokeColor,
      strokeOpacity: strokeStyle.strokeOpacity,
    };
    this.updateStyle.emit(this.pointStyle);
  }

  public updateFillAttributes(fillStyle: FillStyle) {
    this.pointStyle = {
      ...this.pointStyle,
      fillOpacity: fillStyle.fillOpacity,
      fillColor: fillStyle.fillColor,
    };
    this.updateStyle.emit(this.pointStyle);
  }

  public updatePointRadius() {
    this.pointStyle = {
      ...this.pointStyle,
      pointRadius: this.pointRadius,
    };
    this.updateStyle.emit(this.pointStyle);
  }
}
