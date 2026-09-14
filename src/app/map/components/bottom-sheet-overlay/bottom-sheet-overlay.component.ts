import {Component, inject, input, ChangeDetectionStrategy} from '@angular/core';
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
import {StatisticsComponent} from '../feature-info-overlay/statistics/statistics.component';
import {FeatureFlagDirective} from '../../../shared/directives/feature-flag.directive';
import {selectQueryMode} from '../../../state/map/reducers/query-mode.reducer';
import {QueryModeActions} from '../../../state/map/actions/query-mode.actions';
import {QueryMode} from '../../../shared/types/query-mode.type';

@Component({
  selector: 'bottom-sheet-overlay',
  templateUrl: './bottom-sheet-overlay.component.html',
  styleUrls: ['./bottom-sheet-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    BottomSheetItemComponent,
    BasemapSelectionListComponent,
    LegendComponent,
    FeatureInfoComponent,
    MapAttributeFilterComponent,
    ShareLinkMobileComponent,
    SearchWindowMobileComponent,
    MapManagementMobileComponent,
    StatisticsComponent,
    FeatureFlagDirective,
  ],
})
export class BottomSheetOverlayComponent {
  private readonly store = inject(Store);

  public readonly showInteractiveElements = input(true);
  public readonly bottomSheetContent = this.store.selectSignal(selectBottomSheetContent);
  public readonly queryMode = this.store.selectSignal(selectQueryMode);

  public setQueryMode(queryMode: QueryMode) {
    this.store.dispatch(QueryModeActions.setQueryMode({queryMode}));
  }
}
