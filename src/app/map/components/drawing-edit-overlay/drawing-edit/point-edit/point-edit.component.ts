import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3PointStyle, PointStyleConfiguration} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'point-edit',
  templateUrl: './point-edit.component.html',
  styleUrl: './point-edit.component.scss',
})
export class PointEditComponent {
  @Input() public pointStyle!: Gb3PointStyle;

  @Output() public updateStyle = new EventEmitter<Gb3PointStyle>();

  public updateValue(field: keyof PointStyleConfiguration, value: number | string) {
    this.pointStyle = {
      ...this.pointStyle,
      [field]: value,
    };
    this.updateStyle.emit(this.pointStyle);
  }
}
