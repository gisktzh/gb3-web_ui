import {Component, OnDestroy, OnInit} from '@angular/core';
import {filter, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectSelectedDrawing} from '../../../../state/map/reducers/drawing.reducer';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingActions} from '../../../../state/map/actions/drawing.actions';

@Component({
  selector: 'drawing-edit',
  templateUrl: './drawing-edit.component.html',
  styleUrl: './drawing-edit.component.scss',
})
export class DrawingEditComponent implements OnInit, OnDestroy {
  public selectedFeature?: Gb3StyledInternalDrawingRepresentation;
  public style?: Gb3StyleRepresentation;

  private readonly selectedFeature$ = this.store.select(selectSelectedDrawing);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public updateStyle(style: Gb3StyleRepresentation, labelText?: string) {
    this.store.dispatch(DrawingActions.updateDrawingStyles({style, drawing: this.selectedFeature!, labelText}));
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
