import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3PointStyle, PointStyleConfiguration} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'point-edit',
  templateUrl: './point-edit.component.html',
  styleUrl: './point-edit.component.scss',
  standalone: false,
})
export class PointEditComponent {
  @Input() public pointStyle!: Gb3PointStyle;

  @Output() public updateStyleEvent = new EventEmitter<Gb3PointStyle>();

  public updateValue(field: keyof PointStyleConfiguration, value: number | string) {
    this.pointStyle = {
      ...this.pointStyle,
      [field]: value,
    };
    this.updateStyleEvent.emit(this.pointStyle);
  }
}
