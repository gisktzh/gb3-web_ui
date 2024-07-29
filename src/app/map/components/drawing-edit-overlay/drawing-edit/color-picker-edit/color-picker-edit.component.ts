import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'color-picker-edit',
  templateUrl: './color-picker-edit.component.html',
  styleUrl: './color-picker-edit.component.scss',
})
export class ColorPickerEditComponent {
  @Input() public fillColor: string = '';
  @Input() public title: string = '';

  @Output() public updateColor = new EventEmitter<string>();

  public updateColorValue() {
    this.updateColor.emit(this.fillColor);
  }
}
