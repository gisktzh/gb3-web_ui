import {Component, model} from '@angular/core';
import {Gb3LineStringStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {form, FormField} from '@angular/forms/signals';

@Component({
  selector: 'line-edit',
  templateUrl: './line-edit.component.html',
  styleUrl: './line-edit.component.scss',
  imports: [SliderEditComponent, ColorPickerEditComponent, FormField],
})
export class LineEditComponent {
  public readonly lineStyle = model.required<Gb3LineStringStyle>();
  public lineStyleForm = form(this.lineStyle);
}
