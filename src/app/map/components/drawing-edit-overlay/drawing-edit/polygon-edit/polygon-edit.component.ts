import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  Gb3LineStringStyle,
  Gb3PolygonStyle,
  Gb3StyleRepresentation,
} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'polygon-edit',
  templateUrl: './polygon-edit.component.html',
  styleUrl: './polygon-edit.component.scss',
})
export class PolygonEditComponent implements OnInit {
  @Input() public polygonStyle!: Gb3PolygonStyle;

  public polygonFillOpacity: number = 0;
  public polygonFillColor: string = '';

  public ngOnInit(): void {
    this.polygonFillOpacity = this.polygonStyle.fillOpacity;
    this.polygonFillColor = this.polygonStyle.fillColor;
  }

  @Output() public updateStyle = new EventEmitter<Gb3StyleRepresentation>();
  public updateStyleAttributes(strokeStyle: Gb3LineStringStyle) {
    this.polygonStyle = {
      ...this.polygonStyle,
      strokeWidth: strokeStyle.strokeWidth,
      strokeColor: strokeStyle.strokeColor,
      strokeOpacity: strokeStyle.strokeOpacity,
    };
    this.updateStyle.emit(this.polygonStyle);
  }

  public updateFillAttributes() {
    this.updateStyle.emit({...this.polygonStyle, fillOpacity: this.polygonFillOpacity, fillColor: this.polygonFillColor});
  }
}
