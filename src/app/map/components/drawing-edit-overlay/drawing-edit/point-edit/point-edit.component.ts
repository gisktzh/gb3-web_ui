import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3PointStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'point-edit',
  templateUrl: './point-edit.component.html',
  styleUrl: './point-edit.component.scss',
})
export class PointEditComponent {
  @Input() public pointStyle!: Gb3PointStyle;

  @Output() public updateStyle = new EventEmitter<Gb3PointStyle>();

  public updateSliderValue(field: string, strokeWidth: number) {
    this.pointStyle = {
      ...this.pointStyle,
      [field]: strokeWidth,
    };
    this.updateStyle.emit(this.pointStyle);
  }

  public updateColorValue(field: string, color: string) {
    this.pointStyle = {
      ...this.pointStyle,
      [field]: color,
    };
    this.updateStyle.emit(this.pointStyle);
  }
}
