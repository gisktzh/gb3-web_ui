import {Component, effect, linkedSignal, model, ChangeDetectionStrategy} from '@angular/core';
import {Gb3LineStringStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {form, FormField} from '@angular/forms/signals';

const DEFAULT_DATA = {
  strokeOpacity: 1,
  strokeWidth: 1,
  strokeColor: '#ff0000',
};

@Component({
  selector: 'line-edit',
  templateUrl: './line-edit.component.html',
  styleUrl: './line-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SliderEditComponent, ColorPickerEditComponent, FormField],
})
export class LineEditComponent {
  public readonly lineStyle = model.required<Gb3LineStringStyle>();
  public readonly lineStyleFormModel = linkedSignal({
    source: this.lineStyle,
    computation: (value) => ({
      ...DEFAULT_DATA,
      ...value,
    }),
  });
  public lineStyleForm = form(this.lineStyleFormModel);

  constructor() {
    effect(() => {
      const styleFormModel = this.lineStyleFormModel();
      const style = this.lineStyle();

      if (JSON.stringify(styleFormModel) !== JSON.stringify(style)) {
        this.lineStyle.set({...this.lineStyleFormModel()});
      }
    });
  }
}
