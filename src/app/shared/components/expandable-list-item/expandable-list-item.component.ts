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
  public readonly expanded = input(false);
  public readonly header = input('');
  public readonly disabled = input(false);
  public readonly loadingState = input<LoadingState>(undefined);
  public readonly numberOfItems = input<number | undefined>(0);
  public readonly showBadge = input(false);
  public readonly noPadding = input(false);
  public readonly allowTabFocus = input(true);
  public readonly stickyHeader = input(false);
  public readonly renderContentEagerly = input(false);
  public readonly expansionPanel = viewChild.required<MatExpansionPanel>('itemExpansionPanel');

  constructor() {
    // If done via the [expanded] prop, this will trigger a NG0100.
    effect(() => {
      if (this.expanded()) {
        this.expansionPanel().open();
      }
    });
  }
}
