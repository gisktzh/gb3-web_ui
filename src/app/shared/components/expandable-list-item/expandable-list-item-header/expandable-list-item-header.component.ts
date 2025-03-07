import {Component, Input} from '@angular/core';
import {LoadingState} from 'src/app/shared/types/loading-state.type';

@Component({
  selector: 'expandable-list-item-header',
  templateUrl: './expandable-list-item-header.component.html',
  styleUrls: ['./expandable-list-item-header.component.scss'],
  standalone: false,
})
export class ExpandableListItemHeaderComponent {
  @Input() public title!: string;
  @Input() public isExpanded: boolean = true;
  @Input() public loadingState: LoadingState;
  @Input() public numberOfItems: number = 0;
  @Input() public showBadge: boolean = false;
}
