import {Component, effect, linkedSignal, model, ChangeDetectionStrategy} from '@angular/core';
import {Gb3PolygonStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
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
};

@Component({
  selector: 'polygon-edit',
  templateUrl: './polygon-edit.component.html',
  styleUrl: './polygon-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SliderEditComponent, ColorPickerEditComponent, MatDivider, FormField],
})
export class PolygonEditComponent {
  public readonly polygonStyle = model.required<Gb3PolygonStyle>();
  public readonly polygonStyleFormModel = linkedSignal({
    source: this.polygonStyle,
    computation: (value) => ({
      ...DEFAULT_DATA,
      ...value,
    }),
  });
  public polygonStyleForm = form(this.polygonStyleFormModel);

  constructor() {
    effect(() => {
      const styleFormModel = this.polygonStyleFormModel();
      const style = this.polygonStyle();

      if (JSON.stringify(styleFormModel) !== JSON.stringify(style)) {
        this.polygonStyle.set({...this.polygonStyleFormModel()});
      }
    });
  }
}
