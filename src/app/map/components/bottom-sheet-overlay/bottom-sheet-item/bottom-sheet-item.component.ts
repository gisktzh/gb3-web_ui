import {Component, Input, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {StyleExpression} from 'src/app/shared/types/style-expression.type';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {ResizeHandlerLocation} from 'src/app/shared/types/resize-handler-location.type';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {BottomSheetHeight} from 'src/app/shared/types/bottom-sheet-height.type';

@Component({
  selector: 'bottom-sheet-item',
  templateUrl: './bottom-sheet-item.component.html',
  styleUrls: ['./bottom-sheet-item.component.scss'],
})
export class BottomSheetItemComponent {
  @Input() public overlayTitle: string = '';
  @Input() public isBlue: boolean = false;
  @Input() public bottomSheetHeight: BottomSheetHeight = 'small';

  public resizeableStyle: StyleExpression = {};
  public location: ResizeHandlerLocation = 'top';

  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public close() {
    this.store.dispatch(MapUiActions.hideBottomSheet());
    this.resizeableStyle = {};
  }

  public resizeOverlay(newStyle: StyleExpression) {
    this.resizeableStyle = newStyle;
  }
}
