import {Component, Input} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {MatExpansionPanel} from '@angular/material/expansion';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';

@Component({
  selector: 'active-map-item-header',
  templateUrl: './active-map-item-header.component.html',
  styleUrls: ['./active-map-item-header.component.scss']
})
export class ActiveMapItemHeaderComponent {
  @Input() public activeMapItem!: ActiveMapItem;
  @Input() public activeMapItemExpansionPanel!: MatExpansionPanel;

  constructor(private readonly store: Store) {}

  public toggleMapItemVisibility(activeMapItem: ActiveMapItem) {
    this.store.dispatch(ActiveMapItemActions.setVisibility({visible: !activeMapItem.visible, activeMapItem}));
  }
}
