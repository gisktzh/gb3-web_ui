import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {BottomSheetContent} from 'src/app/shared/types/bottom-sheet-content.type';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectBottomSheetContent} from 'src/app/state/map/reducers/map-ui.reducer';

@Component({
  selector: 'bottom-sheet-overlay',
  templateUrl: './bottom-sheet-overlay.component.html',
  styleUrls: ['./bottom-sheet-overlay.component.scss'],
})
export class BottomSheetOverlayComponent implements OnInit, OnDestroy {
  @Input() public showInteractiveElements: boolean = true;
  public bottomSheetContent: BottomSheetContent = 'none';

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

  private initSubscriptions() {
    this.subscriptions.add(
      this.bottomSheetContent$.pipe(tap((bottomSheetContent) => (this.bottomSheetContent = bottomSheetContent))).subscribe(),
    );
  }
}
