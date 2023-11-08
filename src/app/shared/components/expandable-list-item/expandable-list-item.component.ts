import {Component, Input} from '@angular/core';
import {LoadingState} from '../../types/loading-state.type';

@Component({
  selector: 'expandable-list-item',
  templateUrl: './expandable-list-item.component.html',
  styleUrls: ['./expandable-list-item.component.scss'],
})
export class ExpandableListItemComponent {
  @Input() public expanded: boolean = false;
  @Input() public header: string = '';
  @Input() public filterString: string | undefined = undefined;
  @Input() public disabled: boolean = false;
  @Input() public loadingState: LoadingState = undefined;
  @Input() public numberOfItems: number = 0;
  @Input() public showBadge: boolean = false;
}
