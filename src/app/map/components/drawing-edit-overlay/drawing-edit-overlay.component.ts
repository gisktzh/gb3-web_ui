import {Component, OnDestroy, OnInit} from '@angular/core';
import {selectIsDrawingEditOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';

@Component({
  selector: 'drawing-edit-overlay',
  templateUrl: './drawing-edit-overlay.component.html',
  styleUrl: './drawing-edit-overlay.component.scss',
})
export class DrawingEditOverlayComponent implements OnInit, OnDestroy {
  public isVisible: boolean = false;

  private readonly isDrawingEditOverlayVisible$ = this.store.select(selectIsDrawingEditOverlayVisible);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapUiActions.setDrawingEditOverlayVisibility({isVisible: false}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.isDrawingEditOverlayVisible$.pipe(tap((isVisible) => (this.isVisible = isVisible))).subscribe());
  }
}
