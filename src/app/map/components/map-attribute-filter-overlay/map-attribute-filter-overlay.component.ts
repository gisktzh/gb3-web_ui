import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectIsAttributeFilterOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {MapAttributeFilterComponent} from '../map-attribute-filter/map-attribute-filter.component';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {CommonModule} from '@angular/common';
import {selectId} from '../../../state/map/reducers/map-attribute-filters-item.reducer';
import {selectItems} from '../../../state/map/reducers/active-map-item.reducer';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {concatLatestFrom} from '@ngrx/effects';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';

@Component({
  selector: 'map-attribute-filter-overlay',
  standalone: true,
  imports: [MapAttributeFilterComponent, MapOverlayComponent, CommonModule],
  templateUrl: './map-attribute-filter-overlay.component.html',
  styleUrl: './map-attribute-filter-overlay.component.scss',
})
export class MapAttributeFilterOverlayComponent implements OnInit, OnDestroy {
  public isVisible = false;
  public mapAttributeFiltersItem: Gb2WmsActiveMapItem | undefined;

  private readonly attributeFilterVisibilty$ = this.store.select(selectIsAttributeFilterOverlayVisible);
  private readonly mapAttributeFiltersItem$ = this.store.select(selectId);
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

  private handleMapAttributeFiltersItemChange(mapAttributeFiltersItemId: string | undefined, activeMapItems: Gb2WmsActiveMapItem[]) {
    let mapAttributeFiltersItem;
    if (mapAttributeFiltersItemId !== undefined) {
      mapAttributeFiltersItem = activeMapItems.find((activeMapItem) => activeMapItem.id === mapAttributeFiltersItemId);
      if (mapAttributeFiltersItem === undefined) {
        // the map attribute filters item ID is still set but the corresponding item is not active anymore => close this component
        this.close();
      }
    }
    this.mapAttributeFiltersItem = mapAttributeFiltersItem;
  }

  private initSubscriptions() {
    this.subscriptions.add(this.attributeFilterVisibilty$.pipe(tap((isVisible) => (this.isVisible = isVisible))).subscribe());
    this.subscriptions.add(
      this.mapAttributeFiltersItem$
        .pipe(
          concatLatestFrom(() => this.store.select(selectItems)),
          tap(([activeMapItemId, activeMapItems]) => {
            const gb2WmsMapItems = activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem));
            this.handleMapAttributeFiltersItemChange(activeMapItemId, gb2WmsMapItems);
          }),
        )
        .subscribe(),
    );
  }
}
