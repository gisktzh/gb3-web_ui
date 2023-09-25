import {Component, Input} from '@angular/core';
import {OverviewMetadataItem} from '../../../../shared/models/overview-metadata-item.model';

@Component({
  selector: 'search-result-entry-data-catalog',
  templateUrl: './search-result-entry-data-catalog.component.html',
  styleUrls: ['./search-result-entry-data-catalog.component.scss'],
})
export class SearchResultEntryDataCatalogComponent {
  @Input() public filteredMetadataItems: OverviewMetadataItem[] = [];
}
