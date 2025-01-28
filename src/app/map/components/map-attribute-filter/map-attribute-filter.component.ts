import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {MapAttributeFiltersItemActions} from '../../../state/map/actions/map-attribute-filters-item.actions';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {SharedModule} from '../../../shared/shared.module';
import {CommonModule} from '@angular/common';
import {selectMapAttributeFiltersItem} from '../../../state/map/selectors/map-attribute-filters-item.selector';

@Component({
  selector: 'map-attribute-filter',
  templateUrl: './map-attribute-filter.component.html',
  styleUrls: ['./map-attribute-filter.component.scss'],
  imports: [SharedModule, CommonModule],
})
export class MapAttributeFilterComponent implements OnInit, OnDestroy {
  public mapAttributeFiltersItem: Gb2WmsActiveMapItem | undefined;
  public screenMode: ScreenMode = 'regular';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly mapAttributeFiltersItem$ = this.store.select(selectMapAttributeFiltersItem);
  private readonly screenMode$ = this.store.select(selectScreenMode);

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public clearMapAttributeFiltersItemId() {
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

  private initSubscriptions() {
    this.subscriptions.add(
      this.mapAttributeFiltersItem$
        .pipe(
          tap((item) => {
            if (item === undefined) {
              this.clearMapAttributeFiltersItemId();
            }
            this.mapAttributeFiltersItem = item;
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
