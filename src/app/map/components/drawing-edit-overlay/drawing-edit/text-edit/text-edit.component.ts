import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3TextStyle, TextStyleConfiguration} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'text-edit',
  templateUrl: './text-edit.component.html',
  styleUrl: './text-edit.component.scss',
})
export class TextEditComponent {
  @Input() public textStyle!: Gb3TextStyle;
  @Input() public labelText!: string;

  @Output() public updateStyle = new EventEmitter<{style: Gb3TextStyle; labelText: string}>();

  public updateValue(field: keyof TextStyleConfiguration, value: number | string) {
    this.textStyle = {
      ...this.textStyle,
      [field]: value.toString(),
    };
    this.updateStyle.emit({style: this.textStyle, labelText: this.labelText});
  }

  protected readonly parseInt = parseInt;
}
