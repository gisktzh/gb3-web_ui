import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectBottomSheetContent, selectBottomSheetHeight} from 'src/app/state/map/reducers/map-ui.reducer';
import {ResizeHandlerLocation} from '../../../shared/types/resize-handler-location.type';
import {StyleExpression} from '../../../shared/types/style-expression.type';
import {BottomSheetHeight} from 'src/app/shared/enums/bottom-sheet-heights.enum';
import {BottomSheetContent} from 'src/app/shared/types/bottom-sheet-content.type';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';

type TabType = 'activeMaps' | 'mapsCatalogue';

@Component({
  selector: 'bottom-sheet-overlay',
  templateUrl: './bottom-sheet-overlay.component.html',
  styleUrls: ['./bottom-sheet-overlay.component.scss'],
})
export class BottomSheetOverlayComponent implements OnInit, OnDestroy {
  @Input() public showPrintButton: boolean = true;
  @Input() public isPrintButtonEnabled: boolean = false;
  @Input() public overlayTitle: string = '';
  @Input() public location: ResizeHandlerLocation = 'top';
  @Input() public isVisible: boolean = false;
  @Input() public isBlue: boolean = false;
  public activeTab: TabType = 'mapsCatalogue';

  public bottomSheetContent: BottomSheetContent = 'none';
  public resizeableStyle: StyleExpression = {};
  @Output() public readonly closeEvent = new EventEmitter<void>();

  public bottomSheetHeight: BottomSheetHeight = BottomSheetHeight.medium;

  private readonly bottomSheetHeight$ = this.store.select(selectBottomSheetHeight);
  private readonly bottomSheetContent$ = this.store.select(selectBottomSheetContent);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapUiActions.hideBottomSheet());
  }

  public resizeOverlay(newStyle: StyleExpression) {
    this.resizeableStyle = newStyle;
  }

  public switchTab(newTab: TabType) {
    this.activeTab = newTab;
  }

  public initSubscriptions() {
    this.subscriptions.add(
      this.bottomSheetHeight$.pipe(tap((bottomSheetHeight) => (this.bottomSheetHeight = bottomSheetHeight))).subscribe(),
    );
    this.subscriptions.add(
      this.bottomSheetContent$.pipe(tap((bottomSheetContent) => (this.bottomSheetContent = bottomSheetContent))).subscribe(),
    );
  }
}
