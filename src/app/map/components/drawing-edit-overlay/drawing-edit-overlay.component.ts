import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {selectIsDrawingEditOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {DrawingActions} from '../../../state/map/actions/drawing.actions';

@Component({
  selector: 'drawing-edit-overlay',
  templateUrl: './drawing-edit-overlay.component.html',
  styleUrl: './drawing-edit-overlay.component.scss',
  standalone: false,
})
export class DrawingEditOverlayComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  public isVisible: boolean = false;

  private readonly isDrawingEditOverlayVisible$ = this.store.select(selectIsDrawingEditOverlayVisible);
  private readonly subscriptions = new Subscription();

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(DrawingActions.cancelEditMode());
  }

  private initSubscriptions() {
    this.subscriptions.add(this.isDrawingEditOverlayVisible$.pipe(tap((isVisible) => (this.isVisible = isVisible))).subscribe());
  }
}
