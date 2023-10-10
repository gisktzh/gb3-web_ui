import {Component, OnDestroy, OnInit} from '@angular/core';
import {concatLatestFrom} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {MapAttributeFiltersItemActions} from '../../../state/map/actions/map-attribute-filters-item.actions';
import {selectItems} from '../../../state/map/reducers/active-map-item.reducer';
import {selectId} from '../../../state/map/reducers/map-attribute-filters-item.reducer';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';

@Component({
  selector: 'map-attribute-filter',
  templateUrl: './map-attribute-filter.component.html',
  styleUrls: ['./map-attribute-filter.component.scss'],
})
export class MapAttributeFilterComponent implements OnInit, OnDestroy {
  public mapAttributeFiltersItem: Gb2WmsActiveMapItem | undefined;
  public screenMode: ScreenMode = 'regular';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly mapAttributeFiltersItem$ = this.store.select(selectId);
  private readonly activeMapItems$ = this.store.select(selectItems);
  private readonly screenMode$ = this.store.select(selectScreenMode);

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapAttributeFiltersItemActions.clearMapAttributeFiltersItemId());
  }

  public updateFilter(filterConfigParameter: string, filterValueName: string, checked: boolean) {
    if (this.mapAttributeFiltersItem) {
      this.store.dispatch(
        ActiveMapItemActions.setAttributeFilterValueState({
          isFilterValueActive: !checked, // not checked means the filter is active
          filterValueName: filterValueName,
          attributeFilterParameter: filterConfigParameter,
          activeMapItem: this.mapAttributeFiltersItem,
        }),
      );
    }
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
    this.subscriptions.add(
      this.mapAttributeFiltersItem$
        .pipe(
          concatLatestFrom(() => this.activeMapItems$),
          tap(([activeMapItemId, activeMapItems]) => {
            const gb2WmsMapItems = activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem));
            this.handleMapAttributeFiltersItemChange(activeMapItemId, gb2WmsMapItems);
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          tap((activeMapItems) => {
            const gb2WmsMapItems = activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem));
            this.handleMapAttributeFiltersItemChange(this.mapAttributeFiltersItem?.id, gb2WmsMapItems);
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.screenMode$
        .pipe(
          tap((screenMode) => {
            this.screenMode = screenMode;
          }),
        )
        .subscribe(),
    );
  }
}
