import {Component, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectBottoSheetOverlayVisibility} from 'src/app/state/map/reducers/map-ui.reducer';

@Component({
  selector: 'bottom-sheet-overlay',
  templateUrl: './bottom-sheet-overlay.component.html',
  styleUrls: ['./bottom-sheet-overlay.component.scss'],
})
export class BottomSheetOverlayComponent implements OnInit {
  public bottomSheetOverlay: boolean = false;

  private readonly bottomSheetOverlay$ = this.store.select(selectBottoSheetOverlayVisibility);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public initSubscriptions() {
    this.subscriptions.add(
      this.bottomSheetOverlay$.pipe(tap((overlayVisibilty) => (this.bottomSheetOverlay = overlayVisibilty))).subscribe(),
    );
  }
}
