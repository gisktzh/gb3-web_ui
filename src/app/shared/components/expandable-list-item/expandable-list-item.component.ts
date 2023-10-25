import {Component, Input} from '@angular/core';
import {Topic} from '../../interfaces/topic.interface';
import {LoadingState} from '../../types/loading-state.type';

const AUTO_OPEN_THRESHOLD = 3;

@Component({
  selector: 'expandable-list-item',
  templateUrl: './expandable-list-item.component.html',
  styleUrls: ['./expandable-list-item.component.scss'],
})
export class ExpandableListItemComponent {
  @Input() public topic: Topic = {title: '', maps: []};
  @Input() public expanded: boolean = false;
  @Input() public header: string = '';
  @Input() filterString: string = '';
  @Input() public loadingState: LoadingState;

  public autoOpenThreshold: number = AUTO_OPEN_THRESHOLD;
}
