import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gb3LineStringStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'line-edit',
  templateUrl: './line-edit.component.html',
  styleUrl: './line-edit.component.scss',
})
export class LineEditComponent {
  @Input() public lineStyle!: Gb3LineStringStyle;

  @Output() public updateStyle = new EventEmitter<Gb3LineStringStyle>();

  public updateSliderValue(field: string, value: number) {
    this.lineStyle = {
      ...this.lineStyle,
      [field]: value,
    };
    this.updateStyle.emit(this.lineStyle);
  }

  public updateColorValue(color: string) {
    this.lineStyle = {
      ...this.lineStyle,
      strokeColor: color,
    };
    this.updateStyle.emit(this.lineStyle);
  }
}
