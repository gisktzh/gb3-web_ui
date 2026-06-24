import {Component, model} from '@angular/core';
import {Gb3TextStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {MapConstants} from '../../../../../shared/constants/map.constants';
import {MatFormField, MatLabel, MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatDivider} from '@angular/material/divider';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {debounce, form, FormField, maxLength, required} from '@angular/forms/signals';

const INPUT_DEBOUNCE_IN_MS = 10;
@Component({
  selector: 'text-edit',
  templateUrl: './text-edit.component.html',
  styleUrl: './text-edit.component.scss',
  imports: [MatFormField, MatLabel, MatInput, FormsModule, MatDivider, SliderEditComponent, ColorPickerEditComponent, FormField],
})
export class TextEditComponent {
  public readonly textStyle = model.required<{
    style: Gb3TextStyle;
    label: string;
  }>();

  public textStyleForm = form(this.textStyle, (fieldPath) => {
    maxLength(fieldPath.label, MapConstants.TEXT_DRAWING_MAX_LENGTH);
    required(fieldPath.label);
    debounce(fieldPath.label, INPUT_DEBOUNCE_IN_MS);
    debounce(fieldPath.style.fontSize, INPUT_DEBOUNCE_IN_MS);
    debounce(fieldPath.style.fontColor, INPUT_DEBOUNCE_IN_MS);
    debounce(fieldPath.style.haloRadius, INPUT_DEBOUNCE_IN_MS);
    debounce(fieldPath.style.haloColor, INPUT_DEBOUNCE_IN_MS);
    debounce(fieldPath.style.labelYOffset, INPUT_DEBOUNCE_IN_MS);
  });
}
