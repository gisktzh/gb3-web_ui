import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3LineStringStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'line-edit',
  templateUrl: './line-edit.component.html',
  styleUrl: './line-edit.component.scss',
})
export class LineEditComponent {
  @Input() public strokeColor: string = '';
  @Input() public strokeWidth: number = 0;
  @Input() public strokeOpacity: number = 0;

  @Output() public updateStroke = new EventEmitter<Gb3LineStringStyle>();

  public updateStrokeAttributes() {
    this.updateStroke.emit({
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeOpacity: this.strokeOpacity,
      type: 'line',
    });
  }
}
