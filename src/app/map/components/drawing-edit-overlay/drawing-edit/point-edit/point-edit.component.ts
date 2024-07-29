import {Component, Input} from '@angular/core';
import {Gb3PointStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'point-edit',
  templateUrl: './point-edit.component.html',
  styleUrl: './point-edit.component.scss',
})
export class PointEditComponent {
  @Input() public pointStyle!: Gb3PointStyle;
}
