import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AreaStyleConfiguration, Gb3PolygonStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'polygon-edit',
  templateUrl: './polygon-edit.component.html',
  styleUrl: './polygon-edit.component.scss',
  standalone: false,
})
export class PolygonEditComponent {
  @Input() public polygonStyle!: Gb3PolygonStyle;

  @Output() public updateStyleEvent = new EventEmitter<Gb3PolygonStyle>();

  public updateValue(field: keyof AreaStyleConfiguration, value: number | string) {
    this.polygonStyle = {
      ...this.polygonStyle,
      [field]: value,
    };
    this.updateStyleEvent.emit(this.polygonStyle);
  }
}
