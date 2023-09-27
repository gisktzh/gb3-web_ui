import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectBottoSheetOverlayVisibility, selectBottomSheetHeight} from 'src/app/state/map/reducers/map-ui.reducer';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {ResizeHandlerLocation} from '../../../shared/types/resize-handler-location.type';
import {StyleExpression} from '../../../shared/types/style-expression.type';
import {BottomSheetHeight} from 'src/app/shared/enums/bottom-sheet-heights.enum';

@Component({
  selector: 'bottom-sheet-overlay',
  templateUrl: './bottom-sheet-overlay.component.html',
  styleUrls: ['./bottom-sheet-overlay.component.scss'],
})
export class BottomSheetOverlayComponent implements OnInit {
  @Input() public overlayTitle: string = '';
  @Input() public location: ResizeHandlerLocation = 'top';
  public resizeableStyle: StyleExpression = {};
  //@Output() public readonly closeEvent = new EventEmitter<void>();

  public bottomSheetOverlay: boolean = false;
  public bottomSheetHeight: BottomSheetHeight = BottomSheetHeight.medium;

  private readonly bottomSheetOverlay$ = this.store.select(selectBottoSheetOverlayVisibility);
  private readonly bottomSheetHeight$ = this.store.select(selectBottomSheetHeight);

  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public onClose() {
    this.resizeableStyle = {};
    this.store.dispatch(MapUiActions.hideBottomSheetOverlay());
  }

  public resizeOverlay(newStyle: StyleExpression) {
    console.log(newStyle);

    this.resizeableStyle = newStyle;
  }

  public initSubscriptions() {
    this.subscriptions.add(
      this.bottomSheetOverlay$.pipe(tap((overlayVisibilty) => (this.bottomSheetOverlay = overlayVisibilty))).subscribe(),
    );
    this.subscriptions.add(
      this.bottomSheetHeight$.pipe(tap((bottomSheetHeight) => (this.bottomSheetHeight = bottomSheetHeight))).subscribe(),
    );
  }
}
