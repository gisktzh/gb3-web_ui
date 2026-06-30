import {Component, inject, input} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectBottomSheetContent} from 'src/app/state/map/reducers/map-ui.reducer';
import {BottomSheetItemComponent} from './bottom-sheet-item/bottom-sheet-item.component';
import {BasemapSelectionListComponent} from '../map-controls/basemap-selector/basemap-selection-list/basemap-selection-list.component';
import {LegendComponent} from '../legend-overlay/legend/legend.component';
import {FeatureInfoComponent} from '../feature-info-overlay/feature-info/feature-info.component';
import {MapAttributeFilterComponent} from '../map-attribute-filter/map-attribute-filter.component';
import {ShareLinkMobileComponent} from '../share-link-mobile/share-link-mobile.component';
import {SearchWindowMobileComponent} from '../search-window-mobile/search-window-mobile.component';

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
    MapManagementMobileComponent,
  ],
})
export class BottomSheetOverlayComponent {
  private readonly store = inject(Store);

  public readonly showInteractiveElements = input(true);
  public readonly bottomSheetContent = this.store.selectSignal(selectBottomSheetContent);
}
