import {Component, computed, effect, inject, model} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectSelectedDrawing} from '../../../../state/map/reducers/drawing.reducer';
import {
  Gb3LineStringStyle,
  Gb3PointStyle,
  Gb3PolygonStyle,
  Gb3StyleRepresentation,
  Gb3SymbolStyle,
  Gb3TextStyle,
} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingActions} from '../../../../state/map/actions/drawing.actions';
import {PointEditComponent} from './point-edit/point-edit.component';
import {LineEditComponent} from './line-edit/line-edit.component';
import {PolygonEditComponent} from './polygon-edit/polygon-edit.component';
import {TextEditComponent} from './text-edit/text-edit.component';
import {SymbolEditComponent} from './symbol-edit/symbol-edit.component';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {isGb3SymbolStyle} from 'src/app/shared/type-guards/gb3-symbol-style.type-guard';

@Component({
  selector: 'drawing-edit',
  templateUrl: './drawing-edit.component.html',
  styleUrl: './drawing-edit.component.scss',
  imports: [PointEditComponent, LineEditComponent, PolygonEditComponent, TextEditComponent, SymbolEditComponent],
})
export class DrawingEditComponent {
  private readonly store = inject(Store);
  private readonly drawingSymbolsService = inject<DrawingSymbolsService>(DRAWING_SYMBOLS_SERVICE);

  public readonly selectedFeature = this.store.selectSignal(selectSelectedDrawing);
  public readonly style = model<Gb3StyleRepresentation | undefined>(this.selectedFeature()?.properties.style);

  public readonly isPointStyle = computed(() => {
    return this.style()?.type === 'point' ? (this.style() as Gb3PointStyle) : null;
  });
  public readonly isLineStyle = computed(() => {
    return this.style()?.type === 'line' ? (this.style() as Gb3LineStringStyle) : null;
  });
  public readonly isPolygonStyle = computed(() => {
    return this.style()?.type === 'polygon' ? (this.style() as Gb3PolygonStyle) : null;
  });
  public readonly isTextStyle = computed(() => {
    return this.style()?.type === 'text' ? (this.style() as Gb3TextStyle) : null;
  });
  public readonly isSymbolStyle = computed(() => {
    return this.style()?.type === 'symbol' ? (this.style() as Gb3SymbolStyle) : null;
  });

  constructor() {
    effect(() => {
      const selectedFeature = this.selectedFeature();
      if (selectedFeature) {
        queueMicrotask(() => {
          this.style.set(selectedFeature.properties.style);
        });
      }
    });
  }

  public async updateStyle(style: Gb3StyleRepresentation, labelText?: string, drawingSymbolDefinition?: DrawingSymbolDefinition | null) {
    if (drawingSymbolDefinition && isGb3SymbolStyle(style)) {
      const mapDrawingSymbol = await this.drawingSymbolsService.convertToMapDrawingSymbol(
        drawingSymbolDefinition,
        style.symbolSize,
        style.symbolRotation,
      );

      this.store.dispatch(
        DrawingActions.updateDrawingStyles({
          style,
          drawing: this.selectedFeature()!,
          labelText,
          mapDrawingSymbol: mapDrawingSymbol === undefined ? null : mapDrawingSymbol,
        }),
      );
    } else {
      this.store.dispatch(DrawingActions.updateDrawingStyles({style, drawing: this.selectedFeature()!, labelText}));
    }
  }
}
