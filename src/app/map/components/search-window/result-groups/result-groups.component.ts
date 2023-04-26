import {Component, Input} from '@angular/core';
import {SearchResultMatch} from "../../../../shared/services/apis/search/interfaces/search-result-match.interface";
import {Map} from "../../../../shared/interfaces/topic.interface";

@Component({
  selector: 'result-groups',
  templateUrl: './result-groups.component.html',
  styleUrls: ['./result-groups.component.scss']
})
export class ResultGroupsComponent {
  @Input() public searchResults: SearchResultMatch[] = [];
  @Input() public specialSearchResults: SearchResultMatch[] = [];
  @Input() public filteredMaps: Map[] = [];
  @Input() public searchTerms: string[] = [];
}
