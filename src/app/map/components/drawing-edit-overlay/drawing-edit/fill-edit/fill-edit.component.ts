import {Component, EventEmitter, Input, Output} from '@angular/core';

export interface FillStyle {
  fillColor: string;
  fillOpacity: number;
}
@Component({
  selector: 'fill-edit',
  templateUrl: './fill-edit.component.html',
  styleUrl: './fill-edit.component.scss',
})
export class FillEditComponent {
  @Input() public fillColor: string = '';
  @Input() public fillOpacity: number = 0;

  @Output() public updateFill = new EventEmitter<FillStyle>();

  public updateFillAttributes() {
    this.updateFill.emit({
      fillColor: this.fillColor,
      fillOpacity: this.fillOpacity,
    });
  }
}
