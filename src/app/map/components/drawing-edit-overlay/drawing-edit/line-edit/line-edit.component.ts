import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3LineStringStyle, LineStyleConfiguration} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';

@Component({
  selector: 'line-edit',
  templateUrl: './line-edit.component.html',
  styleUrl: './line-edit.component.scss',
  imports: [SliderEditComponent, ColorPickerEditComponent],
})
export class LineEditComponent {
  @Input() public lineStyle!: Gb3LineStringStyle;

  @Output() public updateStyleEvent = new EventEmitter<Gb3LineStringStyle>();

  public updateValue(field: keyof LineStyleConfiguration, value: number | string) {
    this.lineStyle = {
      ...this.lineStyle,
      [field]: value,
    };
    this.updateStyleEvent.emit(this.lineStyle);
  }
}
