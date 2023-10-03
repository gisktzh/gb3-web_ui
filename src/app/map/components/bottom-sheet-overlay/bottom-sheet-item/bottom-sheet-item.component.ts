import {Component, Input, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {StyleExpression} from 'src/app/shared/types/style-expression.type';
import {BottomSheetHeight} from 'src/app/shared/enums/bottom-sheet-heights.enum';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectBottomSheetHeight} from 'src/app/state/map/reducers/map-ui.reducer';
import {ResizeHandlerLocation} from 'src/app/shared/types/resize-handler-location.type';

@Component({
  selector: 'bottom-sheet-item',
  templateUrl: './bottom-sheet-item.component.html',
  styleUrls: ['./bottom-sheet-item.component.scss'],
})
export class BottomSheetItemComponent implements OnInit, OnDestroy {
  @Input() public overlayTitle: string = '';
  @Output() public readonly closeEvent = new EventEmitter<void>();

  public resizeableStyle: StyleExpression = {};
  public bottomSheetHeight: BottomSheetHeight = BottomSheetHeight.medium;
  public location: ResizeHandlerLocation = 'top';
  public isBlue: boolean = false;

  private readonly bottomSheetHeight$ = this.store.select(selectBottomSheetHeight);

  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.resizeableStyle = {};
    this.closeEvent.emit();
  }

  public resizeOverlay(newStyle: StyleExpression) {
    this.resizeableStyle = newStyle;
  }

  public initSubscriptions() {
    this.subscriptions.add(
      this.bottomSheetHeight$.pipe(tap((bottomSheetHeight) => (this.bottomSheetHeight = bottomSheetHeight))).subscribe(),
    );
  }
}
