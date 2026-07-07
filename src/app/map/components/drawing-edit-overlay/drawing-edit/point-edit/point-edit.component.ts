import {Component, linkedSignal, model} from '@angular/core';
import {Gb3PointStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {MatDivider} from '@angular/material/divider';
import {form, FormField} from '@angular/forms/signals';

const DEFAULT_DATA = {
  strokeWidth: 1,
  strokeOpacity: 1,
  strokeColor: '#ff0000',
  fillOpacity: 1,
  fillColor: '#ff0000',
  pointRadius: 1,
};

@Component({
  selector: 'point-edit',
  templateUrl: './point-edit.component.html',
  styleUrl: './point-edit.component.scss',
  imports: [SliderEditComponent, ColorPickerEditComponent, MatDivider, FormField],
})
export class PointEditComponent {
  public readonly pointStyle = model.required<Gb3PointStyle>();
  public readonly pointStyleFormModel = linkedSignal({
    source: this.pointStyle,
    computation: (value) => ({
      ...DEFAULT_DATA,
      ...value,
    }),
  });
  public pointStyleForm = form(this.pointStyleFormModel);
}
