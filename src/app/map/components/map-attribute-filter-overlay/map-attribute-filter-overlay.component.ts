import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectIsAttributeFilterOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {MapAttributeFilterComponent} from '../map-attribute-filter/map-attribute-filter.component';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {CommonModule} from '@angular/common';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {selectMapAttributeFiltersItem} from '../../../state/map/selectors/map-attribute-filters-item.selector';

@Component({
  selector: 'map-attribute-filter-overlay',
  imports: [MapAttributeFilterComponent, MapOverlayComponent, CommonModule],
  templateUrl: './map-attribute-filter-overlay.component.html',
  styleUrl: './map-attribute-filter-overlay.component.scss',
})
export class MapAttributeFilterOverlayComponent implements OnInit, OnDestroy {
  public isVisible = false;
  public mapAttributeFiltersItem: Gb2WmsActiveMapItem | undefined;

  private readonly attributeFilterVisibility$ = this.store.select(selectIsAttributeFilterOverlayVisible);
  private readonly mapAttributeFiltersItem$ = this.store.select(selectMapAttributeFiltersItem);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapUiActions.setAttributeFilterVisibility({isVisible: false}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.attributeFilterVisibility$.pipe(tap((isVisible) => (this.isVisible = isVisible))).subscribe());
    this.subscriptions.add(
      this.mapAttributeFiltersItem$
        .pipe(
          tap((mapAttributeFilterItem) => {
            this.mapAttributeFiltersItem = mapAttributeFilterItem;
          }),
        )
        .subscribe(),
    );
  }
}
