import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectSelectedFeature} from '../../../../state/map/reducers/drawing.reducer';
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

  private readonly selectedFeature$ = this.store.select(selectSelectedFeature);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public updateStyle(style: Gb3StyleRepresentation) {
    this.store.dispatch(DrawingActions.updateStyling({style, drawing: this.selectedFeature!}));
  }
  private initSubscriptions() {
    this.subscriptions.add(
      this.selectedFeature$
        .pipe(
          tap((selectedFeature) => {
            if (!selectedFeature) {
              return;
            }
            this.style = selectedFeature?.properties.style;
            this.selectedFeature = selectedFeature;
          }),
        )
        .subscribe(),
    );
  }
}
