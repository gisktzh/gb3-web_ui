import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AreaStyleConfiguration, Gb3PolygonStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'polygon-edit',
  templateUrl: './polygon-edit.component.html',
  styleUrl: './polygon-edit.component.scss',
  imports: [SliderEditComponent, ColorPickerEditComponent, MatDivider],
})
export class PolygonEditComponent {
  @Input() public polygonStyle!: Gb3PolygonStyle;

  @Output() public updateStyleEvent = new EventEmitter<Gb3PolygonStyle>();

  public updateValue(field: keyof AreaStyleConfiguration, value: number | string) {
    this.polygonStyle = {
      ...this.polygonStyle,
      [field]: value,
    };
    this.updateStyleEvent.emit(this.polygonStyle);
  }
}
