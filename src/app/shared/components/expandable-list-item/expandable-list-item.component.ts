import {Component, effect, input, viewChild} from '@angular/core';
import {LoadingState} from '../../types/loading-state.type';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';

import {ExpandableListItemHeaderComponent} from './expandable-list-item-header/expandable-list-item-header.component';

@Component({
  selector: 'expandable-list-item',
  templateUrl: './expandable-list-item.component.html',
  styleUrls: ['./expandable-list-item.component.scss'],
  imports: [MatExpansionPanel, MatExpansionPanelHeader, ExpandableListItemHeaderComponent],
})
export class ExpandableListItemComponent {
  public expanded = input(false);
  public header = input('');
  public disabled = input(false);
  public loadingState = input<LoadingState>(undefined);
  public numberOfItems = input<number | undefined>(0);
  public showBadge = input(false);
  public noPadding = input(false);
  public allowTabFocus = input(true);
  public stickyHeader = input(false);
  public renderContentEagerly = input(false);
  public expansionPanel = viewChild.required<MatExpansionPanel>('itemExpansionPanel');

  constructor() {
    // If done via the [expanded] prop, this will trigger a NG0100.
    effect(() => {
      if (this.expanded()) {
        this.expansionPanel().open();
      }
    });
  }
}
