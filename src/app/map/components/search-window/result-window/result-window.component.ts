import {Component, Input} from '@angular/core';
import {SearchResultMatch} from "../../../../shared/services/apis/search/interfaces/search-result-match.interface";
import {Map} from "../../../../shared/interfaces/topic.interface";

@Component({
  selector: 'result-window',
  templateUrl: './result-window.component.html',
  styleUrls: ['./result-window.component.scss']
})
export class ResultWindowComponent {
  @Input() public searchResults: SearchResultMatch[] = [];
  @Input() public specialSearchResults: SearchResultMatch[] = [];
  @Input() public filteredMaps: Map[] = [];
  @Input() public searchTerms: string[] = [];
}
