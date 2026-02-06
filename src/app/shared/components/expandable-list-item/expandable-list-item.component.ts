import {Component, Input} from '@angular/core';
import {LoadingState} from '../../types/loading-state.type';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {NgClass} from '@angular/common';
import {ExpandableListItemHeaderComponent} from './expandable-list-item-header/expandable-list-item-header.component';

@Component({
  selector: 'expandable-list-item',
  templateUrl: './expandable-list-item.component.html',
  styleUrls: ['./expandable-list-item.component.scss'],
  imports: [MatExpansionPanel, NgClass, MatExpansionPanelHeader, ExpandableListItemHeaderComponent],
})
export class ExpandableListItemComponent {
  @Input() public expanded: boolean = false;
  @Input() public header: string = '';
  @Input() public filterString: string | undefined = undefined;
  @Input() public disabled: boolean = false;
  @Input() public loadingState: LoadingState = undefined;
  @Input() public numberOfItems: number = 0;
  @Input() public showBadge: boolean = false;
  @Input() public noPadding: boolean = false;
  @Input() public allowTabFocus: boolean = true;
  @Input() public stickyHeader: boolean = false;
  @Input() public renderContentEagerly: boolean = false;
}
