import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3PolygonStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'polygon-edit',
  templateUrl: './polygon-edit.component.html',
  styleUrl: './polygon-edit.component.scss',
})
export class PolygonEditComponent {
  @Input() public polygonStyle!: Gb3PolygonStyle;

  @Output() public updateStyle = new EventEmitter<Gb3PolygonStyle>();

  public updateSliderValue(field: string, value: number) {
    this.polygonStyle = {
      ...this.polygonStyle,
      [field]: value,
    };
    this.updateStyle.emit(this.polygonStyle);
  }

  public updateColorValue(field: string, color: string) {
    this.polygonStyle = {
      ...this.polygonStyle,
      [field]: color,
    };
    this.updateStyle.emit(this.polygonStyle);
  }
}
