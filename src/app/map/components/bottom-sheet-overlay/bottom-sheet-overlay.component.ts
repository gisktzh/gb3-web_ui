import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {BottomSheetContent} from 'src/app/shared/types/bottom-sheet-content.type';
import {selectBottomSheetContent} from 'src/app/state/map/reducers/map-ui.reducer';
import {BottomSheetItemComponent} from './bottom-sheet-item/bottom-sheet-item.component';
import {BasemapSelectionListComponent} from '../map-controls/basemap-selector/basemap-selection-list/basemap-selection-list.component';
import {LegendComponent} from '../legend-overlay/legend/legend.component';
import {FeatureInfoComponent} from '../feature-info-overlay/feature-info/feature-info.component';
import {MapAttributeFilterComponent} from '../map-attribute-filter/map-attribute-filter.component';
import {ShareLinkMobileComponent} from '../share-link-mobile/share-link-mobile.component';
import {SearchWindowMobileComponent} from '../search-window-mobile/search-window-mobile.component';
import {NgClass} from '@angular/common';
import {MapManagementMobileComponent} from '../map-management-mobile/map-management-mobile.component';

@Component({
  selector: 'bottom-sheet-overlay',
  templateUrl: './bottom-sheet-overlay.component.html',
  styleUrls: ['./bottom-sheet-overlay.component.scss'],
  imports: [
    BottomSheetItemComponent,
    BasemapSelectionListComponent,
    LegendComponent,
    FeatureInfoComponent,
    MapAttributeFilterComponent,
    ShareLinkMobileComponent,
    SearchWindowMobileComponent,
    NgClass,
    MapManagementMobileComponent,
  ],
})
export class BottomSheetOverlayComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public showInteractiveElements: boolean = true;
  public bottomSheetContent: BottomSheetContent = 'none';

  private readonly bottomSheetContent$ = this.store.select(selectBottomSheetContent);
  private readonly subscriptions = new Subscription();

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.bottomSheetContent$.pipe(tap((bottomSheetContent) => (this.bottomSheetContent = bottomSheetContent))).subscribe(),
    );
  }
}
