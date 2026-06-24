import {Component, input, model} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'color-picker-edit',
  templateUrl: './color-picker-edit.component.html',
  styleUrl: './color-picker-edit.component.scss',
  imports: [FormsModule],
})
export class ColorPickerEditComponent {
  public readonly value = model('');
  public readonly title = input('');
}
