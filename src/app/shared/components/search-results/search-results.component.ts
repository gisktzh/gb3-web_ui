import {Component, Input} from '@angular/core';
import {SearchResultMatch} from '../../services/apis/search/interfaces/search-result-match.interface';
import {Map} from '../../interfaces/topic.interface';

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent {
  @Input() public searchResults: SearchResultMatch[] = [];
  @Input() public specialSearchResults: SearchResultMatch[] = [];
  @Input() public filteredMaps: Map[] = [];
  @Input() public searchTerms: string[] = [];
}
