import {Component, EventEmitter, Input, Output} from '@angular/core';

export interface StrokeStyle {
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;
}
@Component({
  selector: 'stroke-edit',
  templateUrl: './stroke-edit.component.html',
  styleUrl: './stroke-edit.component.scss',
})
export class StrokeEditComponent {
  @Input() public strokeColor: string = '';
  @Input() public strokeWidth: number = 0;
  @Input() public strokeOpacity: number = 0;

  @Output() public updateStroke = new EventEmitter<StrokeStyle>();

  public updateStrokeAttributes() {
    this.updateStroke.emit({
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeOpacity: this.strokeOpacity,
    });
  }
}
