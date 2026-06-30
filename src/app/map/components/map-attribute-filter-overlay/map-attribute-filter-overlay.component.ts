import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectIsAttributeFilterOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {MapAttributeFilterComponent} from '../map-attribute-filter/map-attribute-filter.component';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {selectMapAttributeFiltersItem} from '../../../state/map/selectors/map-attribute-filters-item.selector';

@Component({
  selector: 'map-attribute-filter-overlay',
  imports: [MapAttributeFilterComponent, MapOverlayComponent],
  templateUrl: './map-attribute-filter-overlay.component.html',
  styleUrl: './map-attribute-filter-overlay.component.scss',
})
export class MapAttributeFilterOverlayComponent {
  private readonly store = inject(Store);

  public readonly isVisible = this.store.selectSignal(selectIsAttributeFilterOverlayVisible);
  public readonly mapAttributeFiltersItem = this.store.selectSignal(selectMapAttributeFiltersItem);

  public close() {
    this.store.dispatch(MapUiActions.setAttributeFilterVisibility({isVisible: false}));
  }
}
