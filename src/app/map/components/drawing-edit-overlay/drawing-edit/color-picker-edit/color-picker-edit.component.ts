import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'color-picker-edit',
  templateUrl: './color-picker-edit.component.html',
  styleUrl: './color-picker-edit.component.scss',
  imports: [FormsModule],
})
export class ColorPickerEditComponent {
  @Input() public fillColor: string = '';
  @Input() public title: string = '';

  @Output() public updateColorEvent = new EventEmitter<string>();

  public updateColor() {
    this.updateColorEvent.emit(this.fillColor);
  }
}
