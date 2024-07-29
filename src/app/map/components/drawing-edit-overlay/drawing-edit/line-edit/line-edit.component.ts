import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3LineStringStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {StrokeStyle} from '../stroke-edit/stroke-edit.component';

@Component({
  selector: 'line-edit',
  templateUrl: './line-edit.component.html',
  styleUrl: './line-edit.component.scss',
})
export class LineEditComponent {
  @Input() public lineStyle!: Gb3LineStringStyle;

  @Output() public updateStyle = new EventEmitter<Gb3LineStringStyle>();

  public updateStrokeAttributes(lineStyle: StrokeStyle) {
    this.updateStyle.emit({
      ...this.lineStyle,
      strokeWidth: lineStyle.strokeWidth,
      strokeColor: lineStyle.strokeColor,
      strokeOpacity: lineStyle.strokeOpacity,
    });
  }
}
