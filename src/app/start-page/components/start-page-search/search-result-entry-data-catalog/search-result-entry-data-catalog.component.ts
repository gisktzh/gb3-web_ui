import {Component, Input} from '@angular/core';

import {DataCatalogueSearchResultDisplayItem} from '../../../../shared/interfaces/data-catalogue-search-resuilt-display.interface';

@Component({
  selector: 'search-result-entry-data-catalog',
  templateUrl: './search-result-entry-data-catalog.component.html',
  styleUrls: ['./search-result-entry-data-catalog.component.scss'],
})
export class SearchResultEntryDataCatalogComponent {
  @Input() public filteredMetadataItems: DataCatalogueSearchResultDisplayItem[] = [];
}
