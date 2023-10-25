import {Component, Input} from '@angular/core';
import {Topic} from '../../interfaces/topic.interface';
import {LoadingState} from '../../types/loading-state.type';

@Component({
  selector: 'expandable-list-item',
  templateUrl: './expandable-list-item.component.html',
  styleUrls: ['./expandable-list-item.component.scss'],
})
export class ExpandableListItemComponent {
  @Input() public topic: Topic = {title: '', maps: []};
  @Input() public expanded: boolean = false;
  @Input() public header: string = '';
  @Input() public filterString: string = '';
  @Input() public filteredMapsLength: number = 0;
  @Input() public searchResultsLength: number = 0;
  @Input() public type: string = '';
  @Input() public disabled: boolean = false;
  @Input() public loadingState: LoadingState = undefined;
  @Input() public numberOfItems: number = 0;
}
