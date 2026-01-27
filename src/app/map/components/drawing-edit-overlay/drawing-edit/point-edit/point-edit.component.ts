import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3PointStyle, PointStyleConfiguration} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'point-edit',
  templateUrl: './point-edit.component.html',
  styleUrl: './point-edit.component.scss',
  imports: [SliderEditComponent, ColorPickerEditComponent, MatDivider],
})
export class PointEditComponent {
  @Input() public pointStyle!: Gb3PointStyle;

  @Output() public readonly updateStyleEvent = new EventEmitter<Gb3PointStyle>();

  public updateValue(field: keyof PointStyleConfiguration, value: number | string) {
    this.pointStyle = {
      ...this.pointStyle,
      [field]: value,
    };
    this.updateStyleEvent.emit(this.pointStyle);
  }
}
