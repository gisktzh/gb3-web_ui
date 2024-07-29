import {Component, Input} from '@angular/core';
import {Gb3TextStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'text-edit',
  templateUrl: './text-edit.component.html',
  styleUrl: './text-edit.component.scss',
})
export class TextEditComponent {
  @Input() public textStyle!: Gb3TextStyle;
}
