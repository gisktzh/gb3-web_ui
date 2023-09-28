import {Component, Input} from '@angular/core';
import {LoadingState} from '../../../../shared/types/loading-state.type';

@Component({
  selector: 'search-result-group',
  templateUrl: './search-result-group.component.html',
  styleUrls: ['./search-result-group.component.scss'],
})
export class SearchResultGroupComponent {
  @Input() public header: string = '';
  @Input() public loadingState?: LoadingState;
}
