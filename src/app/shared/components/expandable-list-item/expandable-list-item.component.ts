import {Component, Input} from '@angular/core';
import {Map, Topic} from '../../interfaces/topic.interface';
import {GeometrySearchApiResultMatch} from '../../services/apis/search/interfaces/search-api-result-match.interface';
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
  @Input() public badge: number = 0;
  @Input() public filterString: string = '';
  @Input() public filteredMaps: Map[] = [];
  @Input() public searchResults: GeometrySearchApiResultMatch[] = [];
  @Input() public type: string = '';

  @Input() public loadingState: LoadingState;

  public autoOpenThreshold: number = AUTO_OPEN_THRESHOLD;
}
