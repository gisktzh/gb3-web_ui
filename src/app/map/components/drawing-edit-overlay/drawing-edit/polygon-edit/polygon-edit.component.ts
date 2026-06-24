import {Component, model} from '@angular/core';
import {Gb3PolygonStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {MatDivider} from '@angular/material/divider';
import {form, FormField} from '@angular/forms/signals';

@Component({
  selector: 'polygon-edit',
  templateUrl: './polygon-edit.component.html',
  styleUrl: './polygon-edit.component.scss',
  imports: [SliderEditComponent, ColorPickerEditComponent, MatDivider, FormField],
})
export class PolygonEditComponent {
  public readonly polygonStyle = model.required<Gb3PolygonStyle>();
  public polygonStyleForm = form(this.polygonStyle);
}
