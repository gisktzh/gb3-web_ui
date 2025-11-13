import {Gb3SymbolStyle} from 'src/app/shared/interfaces/internal-drawing-representation.interface';
import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {filter, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectSelectedDrawing} from '../../../../state/map/reducers/drawing.reducer';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingActions} from '../../../../state/map/actions/drawing.actions';
import {PointEditComponent} from './point-edit/point-edit.component';
import {LineEditComponent} from './line-edit/line-edit.component';
import {PolygonEditComponent} from './polygon-edit/polygon-edit.component';
import {TextEditComponent} from './text-edit/text-edit.component';
import {SymbolEditComponent} from './symbol-edit/symbol-edit.component';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';
import {scaleCIMSymbolTo, applyCIMSymbolRotation} from '@arcgis/core/symbols/support/cimSymbolUtils.js';

function isGb3SymbolStyle(style: Gb3StyleRepresentation): style is Gb3SymbolStyle {
  return style.type === 'symbol';
}
@Component({
  selector: 'drawing-edit',
  templateUrl: './drawing-edit.component.html',
  styleUrl: './drawing-edit.component.scss',
  imports: [PointEditComponent, LineEditComponent, PolygonEditComponent, TextEditComponent, SymbolEditComponent],
})
export class DrawingEditComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  public selectedFeature?: Gb3StyledInternalDrawingRepresentation;
  public style?: Gb3StyleRepresentation;

  private readonly selectedFeature$ = this.store.select(selectSelectedDrawing);
  private readonly subscriptions = new Subscription();

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public async updateStyle(style: Gb3StyleRepresentation, labelText?: string, webStyleSymbol?: WebStyleSymbol) {
    if (webStyleSymbol && isGb3SymbolStyle(style)) {
      const cimSymbol = (await webStyleSymbol.fetchSymbol({acceptedFormats: ['cim']})) as CIMSymbol;

      scaleCIMSymbolTo(cimSymbol, style.symbolSize);
      applyCIMSymbolRotation(cimSymbol, style.symbolRotation);

      this.store.dispatch(
        DrawingActions.updateDrawingStyles({
          style,
          drawing: this.selectedFeature!,
          labelText,
          mapDrawingSymbol: {
            webStyleSymbol,
            cimSymbol,
          },
        }),
      );
    } else {
      this.store.dispatch(
        DrawingActions.updateDrawingStyles({style, drawing: this.selectedFeature!, labelText, mapDrawingSymbol: undefined}),
      );
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.selectedFeature$
        .pipe(
          filter((selectedFeature): selectedFeature is Gb3StyledInternalDrawingRepresentation => selectedFeature !== undefined),
          tap((selectedFeature) => {
            this.style = selectedFeature.properties.style;
            this.selectedFeature = selectedFeature;
          }),
        )
        .subscribe(),
    );
  }
}
