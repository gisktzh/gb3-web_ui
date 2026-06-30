import {Component, model} from '@angular/core';
import {Gb3PointStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {MatDivider} from '@angular/material/divider';
import {form, FormField} from '@angular/forms/signals';

@Component({
  selector: 'point-edit',
  templateUrl: './point-edit.component.html',
  styleUrl: './point-edit.component.scss',
  imports: [SliderEditComponent, ColorPickerEditComponent, MatDivider, FormField],
})
export class PointEditComponent {
  public readonly pointStyle = model.required<Gb3PointStyle>();
  public pointStyleForm = form(this.pointStyle);
}
