import {Component, inject} from '@angular/core';
import {selectIsDrawingEditOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {Store} from '@ngrx/store';
import {DrawingActions} from '../../../state/map/actions/drawing.actions';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {DrawingEditComponent} from './drawing-edit/drawing-edit.component';

@Component({
  selector: 'drawing-edit-overlay',
  templateUrl: './drawing-edit-overlay.component.html',
  styleUrl: './drawing-edit-overlay.component.scss',
  imports: [MapOverlayComponent, DrawingEditComponent],
})
export class DrawingEditOverlayComponent {
  private readonly store = inject(Store);

  public readonly isVisible = this.store.selectSignal(selectIsDrawingEditOverlayVisible);

  public close() {
    this.store.dispatch(DrawingActions.cancelEditMode());
  }
}
