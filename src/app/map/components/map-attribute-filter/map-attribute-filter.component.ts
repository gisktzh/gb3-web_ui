import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';

@Component({
  selector: 'map-attribute-filter',
  templateUrl: './map-attribute-filter.component.html',
  styleUrls: ['./map-attribute-filter.component.scss']
})
export class MapAttributeFilterComponent {
  @Output() public closeEvent = new EventEmitter<void>();

  @Input() public activeMapItem!: ActiveMapItem;

  constructor(private readonly store: Store) {}

  public close() {
    this.closeEvent.next();
  }

  public changeFilter(filterConfigParameter: string, filterValueName: string, checked: boolean) {
    this.store.dispatch(
      ActiveMapItemActions.setAttributeFilterValueState({
        isFilterValueActive: !checked, // not checked means the filter is active
        filterValueName: filterValueName,
        attributeFilterParameter: filterConfigParameter,
        activeMapItem: this.activeMapItem
      })
    );
  }
}
